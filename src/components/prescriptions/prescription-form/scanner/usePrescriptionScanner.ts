
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OcrResult } from '../types';

export const usePrescriptionScanner = (onScanComplete: (result: OcrResult, imageData: string) => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'accès à la caméra",
        description: "Impossible d'accéder à la caméra. Veuillez vérifier les permissions."
      });
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setImagePreview(imageDataUrl);
      processImage(imageDataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setImagePreview(imageDataUrl);
      processImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processImage = (imageData: string) => {
    setIsProcessing(true);
    
    // Dans un environnement de production, on appellerait une API OCR ici
    setTimeout(() => {
      // Simuler un résultat d'OCR réaliste
      const mockOcrResult: OcrResult = {
        medications: [
          { 
            id: Date.now().toString(), 
            name: 'Doliprane', 
            dosage: '1000mg', 
            frequency: '3 fois par jour'
          },
          {
            id: (Date.now() + 1).toString(),
            name: 'Efferalgan',
            dosage: '500mg',
            frequency: '2 fois par jour'
          }
        ],
        hospitalName: 'Hôpital Universitaire',
        doctorName: 'Dr. Martin',
        prescriptionDate: new Date().toISOString().split('T')[0]
      };
      
      setIsProcessing(false);
      onScanComplete(mockOcrResult, imageData);
      setIsOpen(false);
      
      toast({
        title: "Ordonnance analysée",
        description: `${mockOcrResult.medications.length} médicaments ont été détectés.`
      });
      
      // Nettoyer
      setImagePreview(null);
      stopCamera();
    }, 3000);
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    setImagePreview(null);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    stopCamera();
    setImagePreview(null);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    isOpen,
    setIsOpen,
    cameraActive,
    imagePreview,
    isProcessing,
    videoRef,
    fileInputRef,
    initCamera,
    stopCamera,
    captureImage,
    handleFileUpload,
    handleOpenDialog,
    handleCloseDialog,
    triggerFileUpload
  };
};
