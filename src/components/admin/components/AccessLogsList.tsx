
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccessLog } from '@/services/supabaseService';

interface AccessLogsListProps {
  accessLogs: AccessLog[];
}

const AccessLogsList: React.FC<AccessLogsListProps> = ({ accessLogs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs d'accès médical</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accessLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{log.action}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Patient:</span> {(log as any).patient?.name || (log as any).patient?.email || 'Inconnu'}
                </div>
                {log.doctor_id && (
                  <div className="text-sm">
                    <span className="font-medium">Médecin:</span> {(log as any).doctor?.name || (log as any).doctor?.email || 'N/A'}
                  </div>
                )}
                {log.details && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Détails:</span> {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {accessLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log d'accès trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessLogsList;
