import type { FastifyError, FastifyInstance } from 'fastify';

export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, _req, reply) => {
    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 500) {
      fastify.log.error(error);
    }

    // Errores de validación de Fastify (schema JSON)
    if (error.validation) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message,
      });
    }

    return reply.code(statusCode).send({
      statusCode,
      error: error.name ?? 'Internal Server Error',
      message: statusCode >= 500 ? 'Error interno del servidor' : error.message,
    });
  });

  fastify.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Ruta no encontrada',
    });
  });
}
