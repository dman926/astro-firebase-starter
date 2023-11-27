import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { uploadImageHandler } from './upload-image';

interface Route {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  handler: RouteHandlerMethod;
}

const routes = [
  {
    method: 'post',
    path: '/upload-image',
    handler: uploadImageHandler,
  },
] as ReadonlyArray<Route>;

export const registerRoutes = (fastify: FastifyInstance) => {
  routes.forEach(({ method, path, handler }) => {
    fastify[method](path, handler);
  });
};
