import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './routes';

const fastify = Fastify({
  logger: true,
});

registerRoutes(fastify);

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.register(cors);

    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
