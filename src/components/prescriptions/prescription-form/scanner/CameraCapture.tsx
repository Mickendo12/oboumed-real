
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture: () => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  videoRef, 
  onCapture, 
  onClose 
}) => {
  return (
    <div className="w-full relative">
      <video 
        ref={videoRef} 
        className="w-full h-64 object-cover rounded" 
        autoPlay 
        playsInline
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-48 border-2 border-primary/50 rounded-lg"></div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <Button onClick={onCapture}>Capturer</Button>
        <Button variant="outline" onClick={onClose} size="icon">
          <X size={18} />
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;
