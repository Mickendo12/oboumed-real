
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signUp, signIn, SignUpData, SignInData } from '@/services/authService';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  onAuthenticated: (user: { email: string }) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'register') {
        const data: SignUpData = { email, password, name };
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
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <Tabs defaultValue="login" value={mode} onValueChange={(value) => setMode(value as AuthMode)}>
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
            {mode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nom complet</label>
                <Input 
                  id="name"
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Entrez votre nom complet" 
                  required 
                />
              </div>
            )}
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
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </Button>
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
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
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
