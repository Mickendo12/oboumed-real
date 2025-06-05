
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

const ProfileFooter: React.FC = () => {
  return (
    <CardFooter className="border-t pt-4">
      <Button variant="outline" size="sm">
        Modifier mes informations
      </Button>
    </CardFooter>
  );
};

export default ProfileFooter;
