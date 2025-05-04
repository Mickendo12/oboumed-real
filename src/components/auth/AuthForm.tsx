
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signUp, signIn, SignUpData, SignInData } from '@/services/authService';
import { AlertCircle, Blood, Phone, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  onAuthenticated: (user: { email: string }) => void;
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  
  const { toast } = useToast();

  const handleNext = () => {
    // Simple validation before proceeding
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setError(null);
    setShowAdditionalInfo(true);
  };

  const handleBack = () => {
    setShowAdditionalInfo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            phoneNumber: emergencyContactPhone
          },
          allergies
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
        setShowAdditionalInfo(false);
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
              : 'Inscrivez-vous pour commencer à suivre vos médicaments.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && !showAdditionalInfo && (
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nom complet*</label>
                  <Input 
                    id="name"
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Entrez votre nom complet" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email*</label>
                  <Input 
                    id="email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Entrez votre email" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Mot de passe*</label>
                  <Input 
                    id="password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Créez un mot de passe" 
                    required 
                  />
                </div>
                <Button 
                  type="button" 
                  className="w-full" 
                  disabled={loading}
                  onClick={handleNext}
                >
                  Continuer
                </Button>
              </>
            )}

            {mode === 'register' && showAdditionalInfo && (
              <>
                <div className="flex items-center mb-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="px-2" 
                    onClick={handleBack}
                  >
                    ← Retour
                  </Button>
                  <h3 className="text-lg font-medium ml-2">Informations médicales</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Blood size={16} />
                    <label htmlFor="bloodType" className="text-sm font-medium">Groupe sanguin</label>
                  </div>
                  <Select value={bloodType} onValueChange={setBloodType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre groupe sanguin" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <label htmlFor="phoneNumber" className="text-sm font-medium">Numéro de téléphone</label>
                  </div>
                  <Input 
                    id="phoneNumber"
                    type="tel" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="Entrez votre numéro de téléphone" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} />
                    <label className="text-sm font-medium">Personne à contacter en cas d'urgence</label>
                  </div>
                  <Input 
                    placeholder="Nom de la personne à contacter"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="mb-2"
                  />
                  <Input 
                    type="tel"
                    placeholder="Numéro de téléphone"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="allergies" className="text-sm font-medium">Allergies</label>
                  <Textarea 
                    id="allergies"
                    value={allergies} 
                    onChange={(e) => setAllergies(e.target.value)} 
                    placeholder="Listez vos allergies (médicaments, aliments, etc.)" 
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : "Terminer l'inscription"}
                </Button>
              </>
            )}

            {mode === 'login' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Entrez votre email" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                  <Input 
                    id="password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Entrez votre mot de passe" 
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Se connecter'}
                </Button>
              </>
            )}
          </form>
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
                setShowAdditionalInfo(false);
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
