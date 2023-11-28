import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { uploadImageHandler } from './upload-image';
import { fetchAllDataHandler } from './fetch-data';

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
  {
    method: 'get',
    path: '/fetch-data',
    handler: fetchAllDataHandler,
  },
] as ReadonlyArray<Route>;

export const registerRoutes = (fastify: FastifyInstance) => {
  routes.forEach(({ method, path, handler }) => {
    fastify[method](path, handler);
  });
};
