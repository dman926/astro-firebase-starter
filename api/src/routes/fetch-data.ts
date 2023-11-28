import { createClient } from '@supabase/supabase-js';
import type { RouteHandlerMethod } from 'fastify/types/route';

export const fetchAllDataHandler: RouteHandlerMethod = async (_req, rep) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
  );

  const results = await Promise.allSettled([
    supabase.from('clients').select('*'),
    supabase.from('sessions').select('*'),
  ]);

  const errors = results.filter((result) => result.status === 'rejected');
  if (errors.length > 0) {
    return rep.status(500).send({
      success: false,
      error: errors[0],
    });
  }

  const [clientsResult, sessionsResult] = results;

  if (
    clientsResult.status === 'fulfilled' &&
    sessionsResult.status === 'fulfilled'
  ) {
    const clientsData = clientsResult.value.data;
    const sessionsData = sessionsResult.value.data;

    return rep.send({
      success: true,
      clients: clientsData,
      sessions: sessionsData,
    });
  } else {
    return rep.status(500).send({
      success: false,
      error: 'One or more promises did not fulfill as expected.',
    });
  }
};

export default fetchAllDataHandler;
