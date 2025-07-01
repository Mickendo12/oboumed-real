import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import DataConfig from "./pages/DataConfig";
import NotFound from "./pages/NotFound";
import PublicPatientProfile from '@/components/public/PublicPatientProfile';
import SecureQRRedirect from '@/components/public/SecureQRRedirect';
import { useBackButton } from './hooks/useBackButton';

const queryClient = new QueryClient();

function App() {
  // Gérer le bouton retour mobile
  useBackButton();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/data-config" element={<DataConfig />} />
              <Route path="/medical-record/:qrCode" element={<PublicPatientProfile />} />
              <Route path="/qr/:qrCode" element={<SecureQRRedirect />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
