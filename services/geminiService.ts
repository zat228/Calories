import { GoogleGenAI, Type } from '@google/genai';
import { FoodItem } from '../types.ts';

// According to the guidelines, the API key must be sourced from process.env.API_KEY.
// The execution environment is assumed to have this variable pre-configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeImageWithGemini(base64ImageData: string): Promise<FoodItem[]> {
  const prompt = `Вы — эксперт-диетолог и ИИ для распознавания продуктов питания. Проанализируйте предоставленное изображение, на котором изображена тарелка с едой.
Ваша задача:
1. Определите каждый отдельный продукт на тарелке.
2. Для каждого продукта оцените его вес в граммах.
3. Для каждого продукта оцените его калорийность в зависимости от размера порции.
4. Предоставьте результат ТОЛЬКО в формате JSON. Не включайте никакого вступительного текста, объяснений или форматирования markdown.
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64ImageData,
            },
          },
          {
            text: prompt,
          }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              portion_grams: { type: Type.NUMBER },
            },
            required: ['name', 'calories', 'portion_grams'],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("API response is empty.");
    }
    
    const data = JSON.parse(jsonText.trim());

    if (!Array.isArray(data)) {
      throw new Error("API response is not an array");
    }
    
    return data as FoodItem[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Не удалось проанализировать изображение. Пожалуйста, попробуйте еще раз.");
  }
}
