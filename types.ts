
export interface FoodItem {
  name: string;
  calories: number;
  portion_grams: number;
}

export enum AnalysisState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}
