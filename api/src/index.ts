import Fastify from 'fastify';
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
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
