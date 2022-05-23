const log = require('pino')({ level: 'info' });
// Require the framework and instantiate it
const fastify = require('fastify')({ logger: log });

// Test route
fastify.get('/', function (req, reply) {
  reply.send({ hello: 'world' });
});

// Start the server
const start = async () => {
  try {
    const PORT = process.env.PORT || 8080;
    await fastify.listen(PORT);

    // fastify.log.info(`Server running at http://localhost:${PORT}`); // fastify.server.address().port
  } catch (e) {
    console.log(e);
    fastify.log.error(e);
    process.exit(1);
  }
};
start();
