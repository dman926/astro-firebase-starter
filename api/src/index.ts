import 'dotenv/config'; // .env
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { registerRoutes } from './routes';

// Verify required env vars are defined
const REQUIRED_ENV_VARS = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const undefined_env_vars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (undefined_env_vars.length) {
  throw new Error(
    `Missing ${undefined_env_vars.join(' and ')} env var${
      undefined_env_vars.length > 1 ? 's' : ''
    }`,
  );
}

const fastify = Fastify({
  logger: true,
});

fastify.register(cors);
fastify.register(multipart, {
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024, // 1 GiB cause I want to just upload stuff
  },
});

registerRoutes(fastify);

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
