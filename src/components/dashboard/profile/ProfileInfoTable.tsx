
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Droplet, Phone, UserPlus, Shield, Stethoscope, Pill } from 'lucide-react';
import { Profile } from '@/services/supabaseService';

interface ProfileInfoTableProps {
  profile: Profile | null;
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
            {profile?.blood_type ? (
              <Badge variant="outline">{profile.blood_type}</Badge>
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
            {profile?.phone_number || <span className="text-muted-foreground text-sm">Non renseigné</span>}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium flex items-center">
            <UserPlus className="mr-2" size={16} />
            Contact d'urgence
          </TableCell>
          <TableCell>
            {profile?.emergency_contact_name ? (
              <div>
                <div>{profile.emergency_contact_name}</div>
                <div className="text-sm text-muted-foreground">{profile.emergency_contact_phone}</div>
                {profile.emergency_contact_relationship && (
                  <div className="text-xs text-muted-foreground">({profile.emergency_contact_relationship})</div>
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
            {profile?.chronic_diseases ? (
              <div className="whitespace-pre-wrap">{profile.chronic_diseases}</div>
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
            {profile?.current_medications ? (
              <div className="whitespace-pre-wrap">{profile.current_medications}</div>
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
