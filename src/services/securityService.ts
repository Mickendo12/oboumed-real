
import { supabase } from '@/integrations/supabase/client';

interface SessionInfo {
  sessionId: string;
  userId: string;
  doctorId: string;
  expiresAt: string;
  lastActivity: string;
}

class SecurityService {
  private static instance: SecurityService;
  private activeSessions: Map<string, SessionInfo> = new Map();
  private inactivityTimer: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes d'inactivité
  private readonly MAX_SESSIONS_PER_DOCTOR = 3; // Maximum 3 sessions simultanées par médecin

  private constructor() {
    this.startInactivityMonitoring();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  public async validateSession(sessionId: string): Promise<boolean> {
    try {
      const { data: session, error } = await supabase
        .from('doctor_access_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single();

      if (error || !session) {
        console.log('Session non trouvée:', sessionId);
        return false;
      }

      // Vérifier l'expiration
      if (new Date(session.expires_at) < new Date()) {
        console.log('Session expirée:', sessionId);
        await this.revokeSession(sessionId);
        return false;
      }

      // Mettre à jour l'activité
      this.updateSessionActivity(sessionId);
      return true;
    } catch (error) {
      console.error('Erreur validation session:', error);
      return false;
    }
  }

  public async createSession(userId: string, doctorId: string, qrCodeId?: string): Promise<string | null> {
    try {
      // Vérifier le nombre de sessions actives du médecin
      const activeSessions = await this.getActiveDoctorSessions(doctorId);
      if (activeSessions >= this.MAX_SESSIONS_PER_DOCTOR) {
        throw new Error(`Maximum ${this.MAX_SESSIONS_PER_DOCTOR} sessions simultanées autorisées`);
      }

      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      const { data: session, error } = await supabase
        .from('doctor_access_sessions')
        .insert({
          patient_id: userId,
          doctor_id: doctorId,
          qr_code_id: qrCodeId,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select('id')
        .single();

      if (error || !session) {
        console.error('Erreur création session:', error);
        return null;
      }

      // Enregistrer dans le cache local
      this.activeSessions.set(session.id, {
        sessionId: session.id,
        userId,
        doctorId,
        expiresAt: expiresAt.toISOString(),
        lastActivity: new Date().toISOString()
      });

      // Logger l'événement de sécurité
      await this.logSecurityEvent('session_created', {
        sessionId: session.id,
        doctorId,
        patientId: userId,
        qrCodeId
      }, userId);

      return session.id;
    } catch (error) {
      console.error('Erreur création session sécurisée:', error);
      throw error;
    }
  }

  public async revokeSession(sessionId: string): Promise<void> {
    try {
      // Récupérer les infos de la session avant de la révoquer
      const session = this.activeSessions.get(sessionId);
      
      await supabase
        .from('doctor_access_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      this.activeSessions.delete(sessionId);
      
      // Logger avec le patient_id si disponible
      const patientId = session?.userId || 'unknown';
      await this.logSecurityEvent('session_revoked', { sessionId }, patientId);
    } catch (error) {
      console.error('Erreur révocation session:', error);
    }
  }

  private updateSessionActivity(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
      this.activeSessions.set(sessionId, session);
    }
  }

  private startInactivityMonitoring(): void {
    this.inactivityTimer = setInterval(() => {
      this.checkInactiveSessions();
    }, 60000); // Vérifier chaque minute
  }

  private async checkInactiveSessions(): Promise<void> {
    const now = new Date();
    
    for (const [sessionId, session] of this.activeSessions) {
      const lastActivity = new Date(session.lastActivity);
      const timeSinceActivity = now.getTime() - lastActivity.getTime();
      
      if (timeSinceActivity > this.INACTIVITY_TIMEOUT) {
        console.log(`Révocation session inactive: ${sessionId}`);
        await this.revokeSession(sessionId);
      }
    }
  }

  private async getActiveDoctorSessions(doctorId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('doctor_access_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Erreur comptage sessions:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Erreur obtention sessions actives:', error);
      return 0;
    }
  }

  private async logSecurityEvent(event: string, details: any, patientId: string = 'system'): Promise<void> {
    try {
      await supabase
        .from('access_logs')
        .insert({
          action: `security_${event}`,
          patient_id: patientId,
          details: {
            event,
            timestamp: new Date().toISOString(),
            ...details
          },
          ip_address: 'system'
        });
    } catch (error) {
      console.error('Erreur log sécurité:', error);
    }
  }

  public cleanup(): void {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
    }
  }
}

export const securityService = SecurityService.getInstance();
