
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { qrCode } = await req.json();

    if (!qrCode) {
      return new Response(
        JSON.stringify({ error: 'QR code manquant' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier si le QR code existe et est actif
    const { data: qrCodeData, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_code', qrCode)
      .eq('status', 'active')
      .single();

    if (qrError || !qrCodeData) {
      console.log('QR code not found or inactive:', qrError);
      return new Response(
        JSON.stringify({ error: 'QR code invalide ou expiré' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Créer une session d'accès de 3 minutes
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Enregistrer l'accès
    const { error: logError } = await supabase
      .from('access_logs')
      .insert({
        patient_id: qrCodeData.user_id,
        action: 'qr_public_access',
        details: { 
          qr_code_id: qrCodeData.id,
          access_type: 'emergency_medical_record',
          session_duration: '3_minutes'
        },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });

    if (logError) {
      console.error('Error logging access:', logError);
    }

    return new Response(
      JSON.stringify({ 
        userId: qrCodeData.user_id,
        expiresAt: expiresAt.toISOString(),
        accessGranted: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in validate-qr-access:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
