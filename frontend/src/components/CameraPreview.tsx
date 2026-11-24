import { useEffect, useRef } from 'react';
import { VideoOff } from 'lucide-react';

interface CameraPreviewProps {
  active: boolean;
  handDetected: boolean;
  stream?: MediaStream | null;
}

export function CameraPreview({ active, handDetected, stream: externalStream }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    // If an external stream is provided (from hand tracking), use it directly
    if (externalStream) {
      if (videoRef.current && !cancelled) {
        videoRef.current.srcObject = externalStream;
      }
      return;
    }
    
    const startCamera = async () => {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        
        if (cancelled) {
          camStream.getTracks().forEach(t => t.stop());
          return;
        }
        
        streamRef.current = camStream;
        if (videoRef.current) {
          videoRef.current.srcObject = camStream;
        }
      } catch {
        // Camera not available
      }
    };
    
    startCamera();
    
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [active, externalStream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-surface-darker border border-border aspect-video max-w-lg mx-auto">
      {active ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {handDetected && (
            <div className="absolute top-4 right-4 bg-success/90 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Hand detected ✓
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-white/80 text-xs bg-black/40 rounded-full px-3 py-1 inline-block">
              📹 Your camera is used only for tracking hand movement. Video is processed locally.
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
          <VideoOff className="w-12 h-12 mb-3 opacity-50" />
          <p>Camera preview</p>
        </div>
      )}
    </div>
  );
}
