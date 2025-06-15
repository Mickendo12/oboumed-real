
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
    console.log('🔄 QR validation request received');
    
    const { qrCode } = await req.json();

    if (!qrCode) {
      console.log('❌ Missing QR code in request');
      return new Response(
        JSON.stringify({ error: 'QR code manquant' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔄 Validating QR code:', qrCode);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if QR code exists and is active
    const { data: qrCodeData, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_code', qrCode)
      .eq('status', 'active')
      .single();

    if (qrError || !qrCodeData) {
      console.log('❌ QR code not found or inactive:', qrError);
      return new Response(
        JSON.stringify({ error: 'QR code invalide ou expiré' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ QR code found:', qrCodeData.id);

    // Check if QR code is expired
    const isExpired = new Date(qrCodeData.expires_at) < new Date();
    if (isExpired) {
      console.log('❌ QR code expired');
      return new Response(
        JSON.stringify({ error: 'QR code expiré' }),
        { 
          status: 410, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create 30-minute access session
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Get IP address properly (take first IP if multiple)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    console.log('🔄 Logging access for user:', qrCodeData.user_id);

    // Log the access
    const { error: logError } = await supabase
      .from('access_logs')
      .insert({
        patient_id: qrCodeData.user_id,
        action: 'qr_public_access',
        details: { 
          qr_code_id: qrCodeData.id,
          access_type: 'emergency_medical_record',
          session_duration: '30_minutes'
        },
        ip_address: ipAddress
      });

    if (logError) {
      console.error('⚠️ Error logging access:', logError);
    } else {
      console.log('✅ Access logged successfully');
    }

    const response = { 
      userId: qrCodeData.user_id,
      expiresAt: expiresAt.toISOString(),
      accessGranted: true
    };

    console.log('✅ QR validation successful:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in validate-qr-access:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
