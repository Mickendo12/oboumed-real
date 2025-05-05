
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signUp, signIn, SignUpData, SignInData } from '@/services/authService';
import { AlertCircle, Droplet, Phone, UserPlus, Pill, Stethoscope } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  onAuthenticated: (user: { email: string }) => void;
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const relationshipTypes = ['Conjoint(e)', 'Parent', 'Enfant', 'Ami(e)', 'Autre'];

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
  
  const { toast } = useToast();

  const handleNext = () => {
    // Simple validation before proceeding
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet*</Label>
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
                  <Label htmlFor="email">Email*</Label>
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
                  <Label htmlFor="password">Mot de passe*</Label>
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

            {mode === 'register' && currentStep === 2 && (
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

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Droplet size={16} />
                        <Label htmlFor="bloodType">Groupe sanguin</Label>
                      </div>
                      <Select value={bloodType} onValueChange={setBloodType}>
                        <SelectTrigger id="bloodType">
                          <SelectValue placeholder="Sélectionnez" />
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
                        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                      </div>
                      <Input 
                        id="phoneNumber"
                        type="tel" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        placeholder="Ex: 06 12 34 56 78" 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus size={16} />
                      <Label>Contact d'urgence</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyName" className="text-xs">Nom et prénom</Label>
                        <Input 
                          id="emergencyName"
                          placeholder="Nom de la personne"
                          value={emergencyContactName}
                          onChange={(e) => setEmergencyContactName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone" className="text-xs">Téléphone</Label>
                        <Input 
                          id="emergencyPhone"
                          type="tel"
                          placeholder="Numéro de téléphone"
                          value={emergencyContactPhone}
                          onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label htmlFor="relationship" className="text-xs">Lien avec vous</Label>
                      <Select 
                        value={emergencyContactRelationship} 
                        onValueChange={setEmergencyContactRelationship}
                      >
                        <SelectTrigger id="relationship">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {relationshipTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={16} />
                      <Label htmlFor="allergies">Allergies</Label>
                    </div>
                    <Textarea 
                      id="allergies"
                      value={allergies} 
                      onChange={(e) => setAllergies(e.target.value)} 
                      placeholder="Médicaments, aliments, substances..." 
                      rows={2}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope size={16} />
                      <Label htmlFor="chronicDiseases">Maladies chroniques</Label>
                    </div>
                    <Textarea 
                      id="chronicDiseases"
                      value={chronicDiseases} 
                      onChange={(e) => setChronicDiseases(e.target.value)} 
                      placeholder="Diabète, hypertension, asthme..." 
                      rows={2}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Pill size={16} />
                      <Label htmlFor="medications">Traitements en cours</Label>
                    </div>
                    <Textarea 
                      id="medications"
                      value={medications} 
                      onChange={(e) => setMedications(e.target.value)} 
                      placeholder="Médicaments pris régulièrement..." 
                      rows={2}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={loading}
                >
                  {loading ? 'Création en cours...' : "Créer mon compte"}
                </Button>
              </>
            )}

            {mode === 'login' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="password">Mot de passe</Label>
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
                  {loading ? 'Connexion...' : 'Se connecter'}
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
                setCurrentStep(1);
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
