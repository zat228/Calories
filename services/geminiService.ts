import { FoodItem } from '../types';

export async function analyzeImageWithGemini(base64ImageData: string): Promise<FoodItem[]> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64ImageData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Use the server's error message if available, otherwise a generic one.
      throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    return data as FoodItem[];

  } catch (error) {
    console.error("Error fetching from /api/analyze:", error);
    // Re-throw a user-friendly error message.
    if (error instanceof Error) {
        // Avoid showing cryptic network errors like "Failed to fetch" directly.
        if (error.message.includes('Failed to fetch')) {
             throw new Error('Не удалось связаться с сервером анализа. Проверьте ваше интернет-соединение.');
        }
        throw new Error(error.message);
    }
    throw new Error("Произошла неизвестная ошибка при обращении к серверу.");
  }
}
