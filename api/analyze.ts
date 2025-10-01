import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem } from '../types';

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { 
        type: Type.STRING,
        description: "Название продукта питания"
      },
      calories: { 
        type: Type.NUMBER,
        description: "Расчетное количество калорий"
      },
      portion_grams: {
        type: Type.NUMBER,
        description: "Расчетный вес порции в граммах"
      },
    },
    required: ['name', 'calories', 'portion_grams'],
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Разрешены только POST-запросы' });
  }

  const { imageData } = req.body;
  if (!imageData) {
    return res.status(400).json({ message: 'Отсутствует imageData в теле запроса' });
  }

  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ message: 'API_KEY не настроен на сервере.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `Вы — эксперт-диетолог и ИИ для распознавания продуктов питания. Проанализируйте предоставленное изображение, на котором изображена тарелка с едой.
Ваша задача:
1. Определите каждый отдельный продукт на тарелке.
2. Для каждого продукта оцените его вес в граммах.
3. Для каждого продукта оцените его калорийность в зависимости от размера порции.
4. Предоставьте результат ТОЛЬКО в формате JSON. Не включайте никакого вступительного текста, объяснений или форматирования markdown, например \`\`\`json.
Выходные данные JSON должны быть массивом объектов. Каждый объект в массиве должен представлять один продукт питания и должен иметь следующие три свойства и ничего больше:
- "name": строка, представляющая название продукта.
- "calories": число, представляющее расчетное общее количество калорий для этого продукта.
- "portion_grams": число, представляющее расчетный вес порции в граммах.
Пример ответа для изображения с яблоком и бананом:
[
  {"name": "Яблоко", "calories": 95, "portion_grams": 180},
  {"name": "Банан", "calories": 105, "portion_grams": 120}
]
Теперь проанализируйте предоставленное изображение и сгенерируйте ответ в формате JSON.`;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageData,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      throw new Error("API response is not an array");
    }
    
    return res.status(200).json(data as FoodItem[]);

  } catch (error) {
    console.error("Error in /api/analyze:", error);
    return res.status(500).json({ message: 'Не удалось проанализировать изображение с помощью Gemini API.' });
  }
}
