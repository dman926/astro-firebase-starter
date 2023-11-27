// import { createClient } from 'supabase-js';
import { checkPreflight, corsHeaders } from 'shared';

// const supabaseUrl = Deno.env.get('SUPABSE_URL') ?? '';
// const supabaseKey = Deno.env.get('SUPABSE_ANON_KEY') ?? '';
// const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve((req) => {
  const preflight = checkPreflight(req);
  if (preflight) {
    return preflight;
  }

  return new Response('done', {
    headers: corsHeaders,
  });
});
