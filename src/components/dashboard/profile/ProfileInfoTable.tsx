
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Droplet, Phone, UserPlus, Shield, Stethoscope, Pill, Weight, Ruler, Activity } from 'lucide-react';
import { ProfileWithBMI } from '@/services/supabaseService';

interface ProfileInfoTableProps {
  profile: ProfileWithBMI | null;
}

const ProfileInfoTable: React.FC<ProfileInfoTableProps> = ({ profile }) => {
  const getBMIBadgeVariant = (bmi?: number) => {
    if (!bmi) return 'secondary';
    if (bmi < 18.5) return 'outline';
    if (bmi < 25) return 'default';
    if (bmi < 30) return 'secondary';
    return 'destructive';
  };

  const getBMICategoryColor = (category?: string) => {
    switch (category) {
      case 'Poids normal': return 'text-green-600';
      case 'Insuffisance pondérale': return 'text-blue-600';
      case 'Surpoids': return 'text-yellow-600';
      case 'Obésité': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium flex items-center">
            <Weight className="mr-2" size={16} />
            Poids
          </TableCell>
          <TableCell>
            {profile?.weight_kg ? (
              <span>{profile.weight_kg} kg</span>
            ) : (
              <span className="text-muted-foreground text-sm">Non renseigné</span>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium flex items-center">
            <Ruler className="mr-2" size={16} />
            Taille
          </TableCell>
          <TableCell>
            {profile?.height_cm ? (
              <span>{profile.height_cm} cm</span>
            ) : (
              <span className="text-muted-foreground text-sm">Non renseigné</span>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium flex items-center">
            <Activity className="mr-2" size={16} />
            IMC
          </TableCell>
          <TableCell>
            {profile?.bmi ? (
              <div className="flex items-center gap-2">
                <Badge variant={getBMIBadgeVariant(profile.bmi)}>
                  {profile.bmi}
                </Badge>
                <span className={`text-sm ${getBMICategoryColor(profile.bmi_category)}`}>
                  {profile.bmi_category}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">
                {(profile?.weight_kg && profile?.height_cm) ? 'Calcul impossible' : 'Poids et taille requis'}
              </span>
            )}
          </TableCell>
        </TableRow>
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
