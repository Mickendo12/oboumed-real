
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterFormStep1Props {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleNext: () => void;
  loading: boolean;
}

const RegisterFormStep1: React.FC<RegisterFormStep1Props> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  handleNext,
  loading
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default RegisterFormStep1;
