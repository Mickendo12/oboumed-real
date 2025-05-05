
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-dot-pattern relative overflow-hidden py-10">
      <div className="container max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center mb-6 text-primary hover:text-primary/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>
        
        <Card className="dark-container">
          <CardHeader>
            <CardTitle className="text-2xl">Politique de Confidentialité</CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="mb-3">
                Chez Micaprod Corporate, nous prenons la confidentialité de vos données très au sérieux. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et 
                protégeons vos informations personnelles lorsque vous utilisez notre application de suivi médical.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Collecte des Informations</h2>
              <p className="mb-3">
                Nous collectons les types d'informations suivants:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Informations d'identification (nom, email, mot de passe)</li>
                <li>Informations médicales (groupe sanguin, allergies, maladies chroniques)</li>
                <li>Coordonnées (numéro de téléphone, contact d'urgence)</li>
                <li>Informations sur les médicaments et ordonnances</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Utilisation des Données</h2>
              <p className="mb-3">
                Vos données sont utilisées pour:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience</li>
                <li>Communiquer avec vous concernant votre compte</li>
                <li>Partager des informations médicales avec votre médecin (avec votre consentement)</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Protection des Données</h2>
              <p className="mb-3">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Les accès non autorisés</li>
                <li>Les altérations</li>
                <li>Les divulgations ou destructions</li>
              </ul>
              <p>
                Toutes vos données sensibles sont cryptées et stockées sur des serveurs sécurisés.
              </p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Vos Droits</h2>
              <p className="mb-3">
                Vous disposez des droits suivants concernant vos données personnelles:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Droit d'accès</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
              <p>
                Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, 
                veuillez nous contacter à: privacy@micaprod-corporate.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
