"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle } from 'lucide-react';

interface CameraScannerProps {
  isScanning: boolean;
  onFaceScanned: (faceData: any, faceNumber: number) => void;
  scannedFaces: number;
}

const faceNames = ['Front', 'Right', 'Back', 'Left', 'Top', 'Bottom'];
const faceColors = {
  0: 'border-red-500',
  1: 'border-blue-500',
  2: 'border-orange-500',
  3: 'border-green-500',
  4: 'border-white',
  5: 'border-yellow-500'
};

export default function CameraScanner({ isScanning, onFaceScanned, scannedFaces }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentFace, setCurrentFace] = useState(0);

  useEffect(() => {
    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isScanning]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'environment' // Use back camera on mobile
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Simulate face detection and color analysis
      setTimeout(() => {
        onFaceScanned({ face: currentFace, colors: [] }, currentFace);
        setCurrentFace(prev => prev + 1);
        setIsCapturing(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Cube Detection Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1 p-4 bg-black/20 rounded-lg backdrop-blur-sm">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 border-2 rounded ${
                      currentFace < 6 ? faceColors[currentFace as keyof typeof faceColors] : 'border-gray-500'
                    } bg-black/30`}
                  />
                ))}
              </div>
            </div>

            {/* Face Counter */}
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
              {scannedFaces < 6 ? `Scan ${faceNames[currentFace]} Face` : 'All Faces Scanned!'}
            </div>

            {/* Progress */}
            <div className="absolute bottom-4 left-4 right-4">
              <Progress value={(scannedFaces / 6) * 100} className="h-2" />
              <div className="text-center text-white text-sm mt-2">
                {scannedFaces}/6 faces completed
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            <div className="text-center text-slate-300">
              <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Camera will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Face Progress Indicators */}
      <div className="grid grid-cols-6 gap-2">
        {faceNames.map((face, index) => (
          <div
            key={face}
            className={`p-2 rounded-lg text-center text-xs border ${
              index < scannedFaces
                ? 'bg-green-600 border-green-500 text-white'
                : index === currentFace && isScanning
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300'
            }`}
          >
            {index < scannedFaces ? (
              <CheckCircle className="h-4 w-4 mx-auto mb-1" />
            ) : (
              <div className="h-4 w-4 mx-auto mb-1 border border-current rounded"></div>
            )}
            {face}
          </div>
        ))}
      </div>

      {/* Capture Button */}
      {isScanning && currentFace < 6 && (
        <div className="text-center">
          <Button
            onClick={captureFace}
            disabled={isCapturing}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCapturing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Capture {faceNames[currentFace]} Face
              </>
            )}
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}