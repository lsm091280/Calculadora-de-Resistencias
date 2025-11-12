import React, { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeResistorImage } from '../services/geminiService';
import { BandColor } from '../types';
import { COLORS } from '../constants';

interface CameraInputProps {
    onAnalysisComplete: (colors: BandColor[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const CameraInput: React.FC<CameraInputProps> = ({ onAnalysisComplete, setLoading, setError }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<{ image: string; colors: BandColor[] } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const startCamera = useCallback(async () => {
        setError(null);
        setCapturedImage(null);
        setIsInitializing(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("No se pudo acceder a la cámara. Asegúrate de haber concedido los permisos.");
            setIsInitializing(false);
        }
    }, [setError]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const captureImage = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                setError("La cámara aún no está lista. Por favor, espera un momento y vuelve a intentarlo.");
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
            }
            stopCamera();
        }
    }, [stopCamera, setError]);

    const analyzeImage = useCallback(async () => {
        if (!capturedImage) return;
        setLoading(true);
        setError(null);
        try {
            const base64Image = capturedImage.split(',')[1];
            if (!base64Image) {
                throw new Error("La imagen capturada está vacía o es inválida.");
            }
            const detectedColors = await analyzeResistorImage(base64Image);
            if (detectedColors.length >= 4) {
                 setAnalysisResult({ image: capturedImage, colors: detectedColors as BandColor[] });
            } else {
                throw new Error("No se detectaron suficientes bandas de color. Intenta con una foto más clara.");
            }
        } catch (err: any) {
            setError(err.message || "Ocurrió un error durante el análisis.");
        } finally {
            setLoading(false);
        }
    }, [capturedImage, setLoading, setError]);

    const reset = () => {
        stopCamera();
        setCapturedImage(null);
        setError(null);
        setAnalysisResult(null);
    };

    const buttonClasses = "font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg";

    return (
        <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg">
             <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            {analysisResult ? (
                <div className="w-full max-w-md flex flex-col items-center animate-fadeIn">
                    <h3 className="text-lg font-semibold text-white mb-2">Colores Detectados</h3>
                    <p className="text-sm text-gray-400 mb-4">Verifica si la IA identificó los colores correctamente.</p>
                    <img src={analysisResult.image} alt="Resistencia analizada" className="w-full rounded-lg shadow-lg mb-4" />
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-6 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        {analysisResult.colors.map((color, index) => (
                            <div key={`${color}-${index}`} className="flex items-center space-x-2 bg-gray-700 rounded-full px-3 py-1">
                                <div 
                                    className="w-4 h-4 rounded-full border-2 border-gray-500"
                                    style={{ backgroundColor: COLORS[color]?.hex || '#FFFFFF' }}
                                ></div>
                                <span className="text-sm text-gray-200 font-medium">{color}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex space-x-4">
                        <button onClick={reset} className={`${buttonClasses} bg-gray-600 hover:bg-gray-700 text-white shadow-gray-900/30`}>
                            Reintentar
                        </button>
                        <button onClick={() => onAnalysisComplete(analysisResult.colors)} className={`${buttonClasses} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30`}>
                            Aceptar y Calcular
                        </button>
                    </div>
                </div>
            ) : capturedImage ? (
                <div className="w-full max-w-md flex flex-col items-center animate-fadeIn">
                    <img src={capturedImage} alt="Resistencia capturada" className="w-full rounded-lg shadow-lg mb-4" />
                    <div className="flex space-x-4">
                        <button onClick={reset} className={`${buttonClasses} bg-gray-600 hover:bg-gray-700 text-white shadow-gray-900/30`}>
                            Tomar otra
                        </button>
                        <button onClick={analyzeImage} className={`${buttonClasses} bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-purple-500/30`}>
                            Analizar
                        </button>
                    </div>
                </div>
            ) : stream ? (
                <div className="w-full max-w-md flex flex-col items-center">
                    <div className="w-full relative mb-4">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline
                            muted
                            className={`w-full rounded-lg shadow-lg transition-opacity duration-500 ${isInitializing ? 'opacity-0' : 'opacity-100'}`}
                            onCanPlay={() => setIsInitializing(false)}
                        ></video>
                        
                        {isInitializing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg">
                                <p className="text-gray-300 text-lg animate-pulse">Ajustando cámara...</p>
                            </div>
                        )}
                    </div>
                    
                    {!isInitializing && (
                         <button onClick={captureImage} className={`${buttonClasses} text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30`}>
                            Capturar Imagen
                        </button>
                    )}
                </div>
            ) : (
                <button 
                    onClick={startCamera} 
                    className={`${buttonClasses} text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30 disabled:opacity-50 disabled:cursor-wait`}
                    disabled={isInitializing}
                >
                    {isInitializing ? 'Iniciando...' : 'Iniciar Cámara'}
                </button>
            )}
        </div>
    );
};

export default CameraInput;