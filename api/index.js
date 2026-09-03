/**
 * Vercel serverless entry — REST only.
 * Business logic lives in Nest (src/); this file bootstraps AppModule on Vercel.
 */
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');

let AppModule;

const server = express();
server.use(
  express.json({
    limit: '5mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
server.use(express.urlencoded({ extended: true, limit: '5mb' }));

let ready;
let bootError;

async function createNest() {
  if (!AppModule) {
    AppModule = require('../dist/app.module').AppModule;
  }
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
    bodyParser: false,
  });
  app.enableCors({ origin: true, credentials: true });
  await app.init();
  return app;
}

module.exports = async (req, res) => {
  try {
    if (bootError) {
      // Allow a fresh attempt after a previous cold-start failure (e.g. database wake).
      bootError = null;
      ready = null;
    }
    if (!ready) {
      ready = createNest().catch((err) => {
        ready = null;
        bootError = err;
        throw err;
      });
    }
    await ready;
    return server(req, res);
  } catch (err) {
    console.error('[api] bootstrap failed:', err);
    if (!res.headersSent) {
      res.statusCode = 503;
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: 'bootstrap_failed',
          message: String(err && err.message ? err.message : err),
        }),
      );
    }
  }
};
