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

export async function analyzeImageWithGemini(base64ImageData: string): Promise<FoodItem[]> {
  // ВАЖНО: Вставьте свой API ключ сюда для тестирования.
  // Не рекомендуется загружать этот ключ в публичный репозиторий.
  const API_KEY = "ВАШ_API_КЛЮЧ_ЗДЕСЬ";

  if (API_KEY === "ВАШ_API_КЛЮЧ_ЗДЕСЬ") {
    throw new Error("Пожалуйста, вставьте ваш настоящий Gemini API ключ в файл services/geminiService.ts");
  }
  
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
      data: base64ImageData,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
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

    // Basic validation
    if (!Array.isArray(data)) {
      throw new Error("API response is not an array");
    }
    
    return data as FoodItem[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Не удалось проанализировать изображение с помощью Gemini API.");
  }
}