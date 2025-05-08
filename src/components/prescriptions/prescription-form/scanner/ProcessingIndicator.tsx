
import React from 'react';
import { Loader2 } from 'lucide-react';

const ProcessingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 size={48} className="animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Analyse de l'image en cours...</p>
    </div>
  );
};

export default ProcessingIndicator;
