
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface PrivacyPolicyAcceptanceProps {
  accepted: boolean;
  setAccepted: (value: boolean) => void;
}

const PrivacyPolicyAcceptance: React.FC<PrivacyPolicyAcceptanceProps> = ({
  accepted,
  setAccepted
}) => {
  return (
    <div className="flex items-start space-x-2 mt-4">
      <Checkbox 
        id="privacy-policy" 
        checked={accepted} 
        onCheckedChange={(checked) => setAccepted(checked as boolean)}
        className="mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <Label 
          htmlFor="privacy-policy" 
          className="text-sm text-muted-foreground"
        >
          J'accepte la <Dialog>
            <DialogTrigger asChild>
              <button className="underline text-primary hover:text-primary/80">
                politique de confidentialité
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Politique de Confidentialité</DialogTitle>
              </DialogHeader>
              <div className="mt-4 text-sm text-left">
                <h3 className="font-semibold mb-2">1. Collecte des Informations</h3>
                <p className="mb-4">
                  Nous collectons des informations personnelles et médicales dans le but de fournir un meilleur service
                  de suivi médical. Ces informations incluent votre nom, adresse email, numéro de téléphone, groupe sanguin,
                  allergies, maladies chroniques, médicaments actuels et contacts d'urgence.
                </p>
                
                <h3 className="font-semibold mb-2">2. Utilisation des Données</h3>
                <p className="mb-4">
                  Vos données sont utilisées pour faciliter votre expérience sur notre plateforme et améliorer
                  la qualité des soins médicaux que vous recevez. Nous pouvons, avec votre consentement, partager
                  certaines informations médicales avec votre médecin traitant.
                </p>
                
                <h3 className="font-semibold mb-2">3. Protection des Données</h3>
                <p className="mb-4">
                  Nous prenons très au sérieux la sécurité de vos données et mettons en place des mesures
                  techniques et organisationnelles appropriées pour protéger vos informations personnelles
                  contre tout accès non autorisé, modification, divulgation ou destruction.
                </p>
                
                <h3 className="font-semibold mb-2">4. Vos Droits</h3>
                <p className="mb-4">
                  Vous disposez d'un droit d'accès, de rectification, d'effacement et de limitation du traitement
                  de vos données. Vous pouvez également vous opposer au traitement de vos données et exercer
                  votre droit à la portabilité des données.
                </p>
                
                <p>
                  Pour toute question concernant notre politique de confidentialité, veuillez
                  consulter notre <Link to="/privacy" className="text-primary underline">page de confidentialité complète</Link>.
                </p>
              </div>
            </DialogContent>
          </Dialog> et consens au traitement de mes données médicales pour améliorer mon suivi de santé.
        </Label>
      </div>
    </div>
  );
};

export default PrivacyPolicyAcceptance;
