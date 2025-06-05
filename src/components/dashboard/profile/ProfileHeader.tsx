
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ProfileHeader: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle>Mon profil médical</CardTitle>
      <CardDescription>
        Informations médicales importantes et contacts d'urgence
      </CardDescription>
    </CardHeader>
  );
};

export default ProfileHeader;
