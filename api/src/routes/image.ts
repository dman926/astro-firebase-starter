import type { RouteHandlerMethod } from 'fastify/types/route';

export const uploadImageHandler: RouteHandlerMethod = (req, rep) => {
  rep.send({ ok: true, x: req.headers });
};

export default uploadImageHandler;
