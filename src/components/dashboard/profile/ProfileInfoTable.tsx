
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Droplet, Phone, UserPlus, Shield, Stethoscope, Pill } from 'lucide-react';
import { UserProfile } from '@/services/authService';

interface ProfileInfoTableProps {
  profile: UserProfile | null;
}

const ProfileInfoTable: React.FC<ProfileInfoTableProps> = ({ profile }) => {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium flex items-center">
            <Droplet className="mr-2" size={16} />
            Groupe sanguin
          </TableCell>
          <TableCell>
            {profile?.bloodType ? (
              <Badge variant="outline">{profile.bloodType}</Badge>
            ) : (
              <span className="text-muted-foreground text-sm">Non renseigné</span>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium flex items-center">
            <Phone className="mr-2" size={16} />
            Téléphone
          </TableCell>
          <TableCell>
            {profile?.phoneNumber || <span className="text-muted-foreground text-sm">Non renseigné</span>}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium flex items-center">
            <UserPlus className="mr-2" size={16} />
            Contact d'urgence
          </TableCell>
          <TableCell>
            {profile?.emergencyContact?.name ? (
              <div>
                <div>{profile.emergencyContact.name}</div>
                <div className="text-sm text-muted-foreground">{profile.emergencyContact.phoneNumber}</div>
                {profile.emergencyContact.relationship && (
                  <div className="text-xs text-muted-foreground">({profile.emergencyContact.relationship})</div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Non renseigné</span>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium flex items-center align-top">
            <Shield className="mr-2 mt-0.5" size={16} />
            Allergies
          </TableCell>
          <TableCell>
            {profile?.allergies ? (
              <div className="whitespace-pre-wrap">{profile.allergies}</div>
            ) : (
              <span className="text-muted-foreground text-sm">Non renseigné</span>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium flex items-center align-top">
            <Stethoscope className="mr-2 mt-0.5" size={16} />
            Maladies chroniques
          </TableCell>
          <TableCell>
            {profile?.chronicDiseases ? (
              <div className="whitespace-pre-wrap">{profile.chronicDiseases}</div>
            ) : (
              <span className="text-muted-foreground text-sm">Non renseigné</span>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium flex items-center align-top">
            <Pill className="mr-2 mt-0.5" size={16} />
            Traitements en cours
          </TableCell>
          <TableCell>
            {profile?.medications ? (
              <div className="whitespace-pre-wrap">{profile.medications}</div>
            ) : (
              <span className="text-muted-foreground text-sm">Non renseigné</span>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ProfileInfoTable;
