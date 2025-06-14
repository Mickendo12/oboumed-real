
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Pill, ScanBarcode, Search } from 'lucide-react';
import { MedicationApiResult } from '@/services/medicationApiService';
import { ScanningModal } from './ScanningModal';
import { ManualEntryModal } from './ManualEntryModal';
import { SearchModal } from './SearchModal';

interface MedicationScannerProps {
  onScan: (medication: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  }) => void;
}

const MedicationScanner: React.FC<MedicationScannerProps> = ({ onScan }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();
  
  // Minuteur pour simuler le scan continu
  const scanIntervalRef = useRef<number | null>(null);
  
  const handleStartScan = () => {
    setIsScannerOpen(true);
  };

  const handleManualEntry = () => {
    setIsManualEntryOpen(true);
    setIsScannerOpen(false);
    setIsSearchOpen(false);
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setIsScannerOpen(false);
    setIsManualEntryOpen(false);
  };

  const closeAllDialogs = () => {
    setIsScannerOpen(false);
    setIsManualEntryOpen(false);
    setIsSearchOpen(false);
    
    // Nettoyer tout intervalle actif
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button 
          onClick={handleStartScan}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <ScanBarcode size={18} />
          Scanner un médicament
        </Button>
        <Button 
          variant="outline" 
          onClick={handleOpenSearch}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Search size={18} />
          Rechercher
        </Button>
        <Button 
          variant="outline" 
          onClick={handleManualEntry}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Pill size={18} />
          Saisie manuelle
        </Button>
      </div>

      {/* Scanner Modal */}
      <ScanningModal 
        isOpen={isScannerOpen} 
        onOpenChange={setIsScannerOpen}
        onScan={onScan}
        onManualEntry={handleManualEntry}
        onClose={closeAllDialogs}
        scanIntervalRef={scanIntervalRef}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelect={onScan}
        onManualEntry={handleManualEntry}
        onClose={closeAllDialogs}
      />

      {/* Manual Entry Modal */}
      <ManualEntryModal 
        isOpen={isManualEntryOpen}
        onOpenChange={setIsManualEntryOpen}
        onSubmit={onScan}
      />
    </div>
  );
};

export default MedicationScanner;
