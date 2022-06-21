import {
  createApp, createConfig,
  createCtx,
  startApp,
} from '@aidbox/node-server-sdk';
import dotenv from 'dotenv';
import {createHelpers} from "./helpers";
import * as operations from "./operations";
import * as subscriptions from "./subscriptions";
import * as entities from "./entities";
import * as resources from "./resources";

dotenv.config()

const config = createConfig();

const ctx = createCtx({
  config,
  manifest: { operations, subscriptions, entities, resources, apiVersion: 2 },
});

const helpers = createHelpers(ctx)

const port = +(process.env.APP_PORT || process.env.PORT || 3000);

const app = createApp({ctx, helpers}, config);

async function main() {
  await startApp(app, port);
}

if (require.main === module) {
  main();
}