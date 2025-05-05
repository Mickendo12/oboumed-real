
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

interface ProfileFooterProps {
  isSharingEnabled: boolean;
}

const ProfileFooter: React.FC<ProfileFooterProps> = ({ isSharingEnabled }) => {
  return (
    <CardFooter className="border-t pt-4">
      <div className="flex justify-between w-full">
        <div className="flex items-center">
          {isSharingEnabled ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              Partage activé
            </Badge>
          ) : (
            <Badge variant="outline">
              Partage désactivé
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm">
          Modifier mes informations
        </Button>
      </div>
    </CardFooter>
  );
};

export default ProfileFooter;
