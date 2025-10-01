
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeImageWithGemini } from './services/geminiService';
import { FoodItem, AnalysisState } from './types';
import { CameraView } from './components/CameraView';
import { ResultsView } from './components/ResultsView';

function App() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>(AnalysisState.Idle);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [foodData, setFoodData] = useState<FoodItem[]>([]);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Не удалось получить доступ к камере. Пожалуйста, проверьте разрешения.");
      setAnalysisState(AnalysisState.Error);
    }
  }, []);

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    
    // Cleanup function to stop camera stream
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };
  }, [capturedImage, startCamera]);


  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        handleAnalyze(imageDataUrl);
      }
    }
  }, [videoRef, canvasRef]);

  const handleAnalyze = async (imageDataUrl: string) => {
    setAnalysisState(AnalysisState.Loading);
    setError(null);
    try {
      const base64Data = imageDataUrl.split(',')[1];
      const results = await analyzeImageWithGemini(base64Data);
      setFoodData(results);
      const total = results.reduce((sum, item) => sum + item.calories, 0);
      setTotalCalories(total);
      setAnalysisState(AnalysisState.Success);
    } catch (err) {
      console.error(err);
      setError('Не удалось проанализировать изображение. Пожалуйста, попробуйте еще раз.');
      setAnalysisState(AnalysisState.Error);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setFoodData([]);
    setTotalCalories(0);
    setError(null);
    setAnalysisState(AnalysisState.Idle);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg p-4 font-sans">
      <main className="w-full max-w-lg mx-auto bg-brand-surface rounded-2xl shadow-2xl overflow-hidden">
        <header className="p-4 border-b border-gray-700 text-center">
          <h1 className="text-2xl font-bold text-brand-text-primary">
            Камера Калорий
          </h1>
          <p className="text-sm text-brand-text-secondary">
            Сфотографируйте свою еду, чтобы узнать ее калорийность
          </p>
        </header>
        
        <div className="relative aspect-square bg-black">
          {!capturedImage ? (
            <CameraView 
              videoRef={videoRef}
              canvasRef={canvasRef}
              onCapture={handleCapture}
              error={analysisState === AnalysisState.Error ? error : null}
            />
          ) : (
            <ResultsView
              imageSrc={capturedImage}
              foodData={foodData}
              totalCalories={totalCalories}
              state={analysisState}
              error={error}
              onRetake={handleRetake}
            />
          )}
        </div>
      </main>
      <footer className="text-center py-4 mt-4">
        <p className="text-xs text-gray-500">Создано с помощью Gemini API</p>
      </footer>
    </div>
  );
}

export default App;
