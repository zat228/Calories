
import React from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCapture: () => void;
  error: string | null;
}

export const CameraView: React.FC<CameraViewProps> = ({ videoRef, canvasRef, onCapture, error }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-between p-4">
        {error ? (
          <div className="w-full bg-red-500/80 text-white p-3 rounded-lg text-center">
            <p className="font-semibold">Ошибка</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="w-full bg-black/50 text-white p-3 rounded-lg text-center backdrop-blur-sm">
             Наведите камеру на еду и нажмите кнопку ниже
          </div>
        )}
        <button
          onClick={onCapture}
          className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Сделать снимок"
        >
          <CameraIcon className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};
