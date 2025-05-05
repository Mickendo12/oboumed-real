
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface ProfileHeaderProps {
  isSharingEnabled: boolean;
  onToggleSharing: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  isSharingEnabled, 
  onToggleSharing 
}) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Mon profil médical</CardTitle>
          <CardDescription>
            Informations médicales importantes et contacts d'urgence
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground mr-2">
            Partager avec mes médecins
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Switch
                checked={isSharingEnabled}
                onCheckedChange={onToggleSharing}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSharingEnabled 
                ? "Désactiver le partage de vos informations médicales"
                : "Activer le partage de vos informations médicales"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </CardHeader>
  );
};

export default ProfileHeader;
