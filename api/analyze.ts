import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

interface FoodItem {
  name: string;
  calories: number;
  portion_grams: number;
}

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


export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64ImageData } = request.body;

  if (!base64ImageData) {
    return response.status(400).json({ error: 'Отсутствует изображение в запросе' });
  }

  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error("API_KEY is not set in environment variables.");
    return response.status(500).json({ error: "Ключ API не настроен на сервере." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ImageData,
      },
    };

    const textPart = { text: prompt };

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = geminiResponse.text.trim();
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      throw new Error("Ответ от API не является массивом");
    }
    
    return response.status(200).json(data as FoodItem[]);

  } catch (error) {
    console.error("Error calling Gemini API from serverless function:", error);
    return response.status(500).json({ error: "Не удалось проанализировать изображение." });
  }
}
