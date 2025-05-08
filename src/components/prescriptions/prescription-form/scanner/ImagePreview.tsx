
import React from 'react';

interface ImagePreviewProps {
  imageUrl: string;
  isProcessing?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, isProcessing = false }) => {
  return (
    <div className="w-full">
      <img 
        src={imageUrl} 
        alt="Aperçu" 
        className="w-full h-64 object-contain rounded" 
      />
      {isProcessing && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
