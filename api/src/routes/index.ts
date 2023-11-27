import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { uploadImageHandler } from './image';

interface Route {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  handler: RouteHandlerMethod;
}

const routes = [
  {
    method: 'get',
    path: '/image',
    handler: uploadImageHandler,
  },
] as ReadonlyArray<Route>;

export const registerRoutes = (fastify: FastifyInstance) => {
  routes.forEach(({ method, path, handler }) => {
    fastify[method](path, handler);
  });
};
