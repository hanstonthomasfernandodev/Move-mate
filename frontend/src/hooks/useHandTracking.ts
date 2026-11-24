import { useEffect, useRef, useCallback, useState } from 'react';

export interface HandPosition {
  x: number;
  y: number;
  detected: boolean;
  timestamp: number;
}

interface UseHandTrackingOptions {
  enabled: boolean;
  gameWidth: number;
  gameHeight: number;
  mirrorX?: boolean;
}

export function useHandTracking({
  enabled,
  gameWidth,
  gameHeight,
  mirrorX = true,
}: UseHandTrackingOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  const positionHistoryRef = useRef<HandPosition[]>([]);
  const [handDetected, setHandDetected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const currentPositionRef = useRef<HandPosition>({ x: 0, y: 0, detected: false, timestamp: 0 });
  const cameraWidthRef = useRef(640);
  const cameraHeightRef = useRef(480);

  const getCurrentPosition = useCallback(() => {
    return currentPositionRef.current;
  }, []);

  const getSmoothedPosition = useCallback(() => {
    const history = positionHistoryRef.current;
    const windowSize = 5;
    if (history.length < windowSize) return currentPositionRef.current;
    
    const recent = history.slice(-windowSize);
    const avgX = recent.reduce((sum, p) => sum + p.x, 0) / recent.length;
    const avgY = recent.reduce((sum, p) => sum + p.y, 0) / recent.length;
    
    return {
      x: avgX,
      y: avgY,
      detected: true,
      timestamp: Date.now(),
    };
  }, []);

  const initializeMediaPipe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dynamic import of MediaPipe
      const vision = await import('@mediapipe/tasks-vision');
      const { HandLandmarker, FilesetResolver } = vision;
      
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      let handLandmarker;
      const commonOptions = {
        runningMode: 'VIDEO' as const,
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      };
      try {
        handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
            delegate: 'GPU',
          },
          ...commonOptions,
        });
      } catch {
        // Fallback to CPU if GPU is unavailable
        handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
            delegate: 'CPU',
          },
          ...commonOptions,
        });
      }
      
      handLandmarkerRef.current = handLandmarker;
      
      // Get camera access
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      
      setStream(cameraStream);
      
      if (!videoRef.current) {
        const video = document.createElement('video');
        video.srcObject = cameraStream;
        video.autoplay = true;
        video.playsInline = true;
        videoRef.current = video;
      } else {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
      }
      
      await videoRef.current.play();
      
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        const checkReady = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            cameraWidthRef.current = videoRef.current.videoWidth || 640;
            cameraHeightRef.current = videoRef.current.videoHeight || 480;
            resolve();
          } else {
            requestAnimationFrame(checkReady);
          }
        };
        checkReady();
      });
      
      setLoading(false);
      
      // Start detection loop
      const detect = () => {
        if (!videoRef.current || !handLandmarkerRef.current || videoRef.current.readyState < 2) {
          animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }
        
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
          const indexTip = results.landmarks[0][8]; // Index finger tip
          
          if (indexTip) {
            // Mirror X for natural interaction
            let x = indexTip.x;
            if (mirrorX) x = 1 - x;
            
            // Map from camera coordinates to game coordinates
            const mappedX = x * gameWidth;
            const mappedY = indexTip.y * gameHeight;
            
            const position: HandPosition = {
              x: mappedX,
              y: mappedY,
              detected: true,
              timestamp: Date.now(),
            };
            
            currentPositionRef.current = position;
            positionHistoryRef.current.push(position);
            
            // Keep last 100 positions
            if (positionHistoryRef.current.length > 100) {
              positionHistoryRef.current = positionHistoryRef.current.slice(-100);
            }
            
            setHandDetected(true);
          }
        } else {
          setHandDetected(false);
        }
        
        animationFrameRef.current = requestAnimationFrame(detect);
      };
      
      animationFrameRef.current = requestAnimationFrame(detect);
      
    } catch (err: any) {
      console.error('MediaPipe initialization error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access is required for movement tracking. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('Camera could not be detected. Please check your browser and camera settings.');
      } else {
        setError('Failed to initialize movement tracking. Please try again.');
      }
      setLoading(false);
    }
  }, [gameWidth, gameHeight, mirrorX]);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (handLandmarkerRef.current) {
      handLandmarkerRef.current.close();
      handLandmarkerRef.current = null;
    }
    positionHistoryRef.current = [];
  }, []);

  useEffect(() => {
    if (enabled) {
      initializeMediaPipe();
    }
    return cleanup;
  }, [enabled, initializeMediaPipe, cleanup]);

  return {
    videoRef,
    canvasRef,
    handDetected,
    loading,
    error,
    stream,
    getCurrentPosition,
    getSmoothedPosition,
    cleanup,
    cameraWidth: cameraWidthRef.current,
    cameraHeight: cameraHeightRef.current,
  };
}
