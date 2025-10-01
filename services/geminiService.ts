import { FoodItem } from '../types.ts';

export async function analyzeImageWithGemini(base64ImageData: string): Promise<FoodItem[]> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData: base64ImageData }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error("Ответ от API не является массивом");
    }

    return data as FoodItem[];

  } catch (error) {
    console.error("Ошибка при вызове /api/analyze:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Не удалось связаться с сервисом анализа.");
  }
}