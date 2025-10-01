
import React, { useState } from 'react';
import { AnalysisState, FoodItem } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';
import { RetryIcon } from './icons/RetryIcon';
import { ListIcon } from './icons/ListIcon';

interface ResultsViewProps {
  imageSrc: string;
  foodData: FoodItem[];
  totalCalories: number;
  state: AnalysisState;
  error: string | null;
  onRetake: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  imageSrc,
  foodData,
  totalCalories,
  state,
  error,
  onRetake,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative w-full h-full text-white">
      <img src={imageSrc} alt="Captured food" className="w-full h-full object-cover" />

      {state === AnalysisState.Loading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
          <LoaderIcon className="w-16 h-16 animate-spin" />
          <p className="text-lg font-semibold">Анализируем...</p>
        </div>
      )}

      {state === AnalysisState.Error && (
        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center gap-4 p-4 text-center backdrop-blur-sm">
          <p className="text-lg font-bold">Произошла ошибка</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={onRetake}
            className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RetryIcon className="w-5 h-5" />
            Попробовать снова
          </button>
        </div>
      )}

      {state === AnalysisState.Success && (
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 backdrop-blur-sm">
          {showDetails && (
            <div className="flex-grow overflow-y-auto mb-4 bg-black/50 rounded-lg p-3">
              <h3 className="text-lg font-bold mb-2">Обнаруженные продукты</h3>
              <ul className="space-y-2 text-sm">
                {foodData.map((item, index) => (
                  <li key={index} className="flex justify-between items-center bg-white/10 p-2 rounded">
                    <span>{item.name} (~{item.portion_grams}г)</span>
                    <span className="font-semibold">{item.calories} ккал</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="bg-gradient-to-t from-brand-primary to-brand-secondary text-white p-4 rounded-xl shadow-lg text-center">
             <p className="text-sm uppercase tracking-wider">Всего калорий</p>
             <p className="text-5xl font-bold my-1">{Math.round(totalCalories)}</p>
             <p className="text-sm">ккал</p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full font-semibold transition-colors w-1/2"
              aria-label={showDetails ? "Скрыть детали" : "Показать детали"}
            >
              <ListIcon className="w-5 h-5" />
              {showDetails ? 'Скрыть' : 'Детали'}
            </button>
            <button
              onClick={onRetake}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full font-semibold transition-colors w-1/2"
              aria-label="Переснять фото"
            >
              <RetryIcon className="w-5 h-5" />
              Переснять
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
