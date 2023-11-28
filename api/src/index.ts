import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { registerRoutes } from './routes';

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
