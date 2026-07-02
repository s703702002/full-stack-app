import { useState, useRef, useEffect, useCallback } from 'react';

export interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

export function CameraCapture({ onCapture }: Readonly<CameraCaptureProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
    } catch (err) {
      console.error('無法存取相機:', err);
      alert('請確認已允許瀏覽器存取相機權限！');
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera, stream]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'camera-capture.jpg', {
                type: 'image/jpeg',
              });
              onCapture(file);
              stopCamera();
            }
          },
          'image/jpeg',
          0.9,
        );
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-slate-50">
      {stream ? (
        <>
          <div className="relative rounded-lg overflow-hidden bg-black max-w-sm">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={stopCamera}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={takePhoto}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold"
            >
              📸 喀嚓！拍照
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={startCamera}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg"
        >
          開啟相機拍照
        </button>
      )}
    </div>
  );
}
