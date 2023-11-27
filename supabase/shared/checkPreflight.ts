import { corsHeaders } from './cors.ts';

export const checkPreflight = (req: Request): Response | undefined => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }
};

export default checkPreflight;
