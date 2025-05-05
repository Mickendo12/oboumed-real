
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { signUp, signIn, SignUpData, SignInData } from '@/services/authService';
import LoginForm from '../LoginForm';
import RegisterStepOne from './RegisterStepOne';
import RegisterStepTwo from './RegisterStepTwo';
import PrivacyPolicyAcceptance from '../PrivacyPolicyAcceptance';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  onAuthenticated: (user: { email: string }) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [medications, setMedications] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  
  const { toast } = useToast();

  const handleNext = () => {
    // Simple validation before proceeding
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    if (!privacyPolicyAccepted) {
      setError("Vous devez accepter la politique de confidentialité pour continuer.");
      return;
    }
    
    setError(null);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && !privacyPolicyAccepted) {
      setError("Vous devez accepter la politique de confidentialité pour créer un compte.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'register') {
        const data: SignUpData = { 
          email, 
          password, 
          name,
          bloodType,
          phoneNumber,
          emergencyContact: {
            name: emergencyContactName,
            phoneNumber: emergencyContactPhone,
            relationship: emergencyContactRelationship
          },
          allergies,
          chronicDiseases,
          medications
        };
        
        const userCredential = await signUp(data);
        
        toast({
          title: "Compte créé",
          description: "Votre compte a été créé avec succès.",
        });
        
        onAuthenticated({ email: userCredential.user.email || email });
      } else {
        const data: SignInData = { email, password };
        const userCredential = await signIn(data);
        
        onAuthenticated({ email: userCredential.user.email || email });
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Handle Firebase auth errors
      let errorMessage = "Une erreur s'est produite. Veuillez réessayer.";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Cette adresse email est déjà utilisée.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Adresse email invalide.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe est trop faible.";
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = "Identifiants invalides. Vérifiez votre email et mot de passe.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <Tabs defaultValue="login" value={mode} onValueChange={(value) => {
        setMode(value as AuthMode);
        setCurrentStep(1);
        setError(null);
      }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Connexion</TabsTrigger>
          <TabsTrigger value="register">Inscription</TabsTrigger>
        </TabsList>
        
        <CardHeader>
          <CardTitle>
            {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez un compte'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' 
              ? 'Entrez vos identifiants pour accéder à vos ordonnances.'
              : currentStep === 1 
                ? 'Entrez vos informations personnelles pour vous inscrire.'
                : 'Ajoutez vos informations médicales pour faciliter la prise en charge.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {mode === 'login' ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          ) : (
            currentStep === 1 ? (
              <>
                <RegisterStepOne
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  handleNext={handleNext}
                  loading={loading}
                />
                
                <PrivacyPolicyAcceptance
                  accepted={privacyPolicyAccepted}
                  setAccepted={setPrivacyPolicyAccepted}
                />
              </>
            ) : (
              <RegisterStepTwo
                bloodType={bloodType}
                setBloodType={setBloodType}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                emergencyContactName={emergencyContactName}
                setEmergencyContactName={setEmergencyContactName}
                emergencyContactPhone={emergencyContactPhone}
                setEmergencyContactPhone={setEmergencyContactPhone}
                emergencyContactRelationship={emergencyContactRelationship}
                setEmergencyContactRelationship={setEmergencyContactRelationship}
                allergies={allergies}
                setAllergies={setAllergies}
                chronicDiseases={chronicDiseases}
                setChronicDiseases={setChronicDiseases}
                medications={medications}
                setMedications={setMedications}
                handleBack={handleBack}
                handleSubmit={handleSubmit}
                loading={loading}
              />
            )
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' 
              ? "Vous n'avez pas de compte? " 
              : "Vous avez déjà un compte? "}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setCurrentStep(1);
                setError(null);
              }}
            >
              {mode === 'login' ? "S'inscrire" : "Se connecter"}
            </Button>
          </p>
        </CardFooter>
      </Tabs>
    </Card>
  );
};

export default AuthForm;
