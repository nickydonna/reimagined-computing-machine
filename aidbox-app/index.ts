import { createApp, createCtx, createManifest, startApp, TDispatchProps, TOperationRequest, TPatientResource, TSubscriptionEvent } from '@aidbox/node-server-sdk';
import dotenv from 'dotenv';

dotenv.config()

const manifest = createManifest({
  appId: process.env.APP_ID,
  appSecret: process.env.APP_SECRET,
  appUrl: process.env.APP_URL,
  resources: {
    AccessPolicy: {},
  },
  operations: {
    test: {
      method: 'GET',
      path: ['$test-operation'],
      handlerFn: async (request: TOperationRequest<any>, {ctx}: TDispatchProps<any>) => {
        ctx.log({ message: { test: true }, v: '2020.02', fx: 'testOperation', type: 'backend-test' });
        console.log('qwer');
        const res = await ctx.request({
          url: "/fhir/Patient/pt-1",
          method: 'PUT',
          data: {
            "name": [{ "family": "John" }]
          }
        })
        return { resource: { test: true } };
      },
    },
  },
  subscriptions: {
    Patient: {
      // @ts-ignore
      handler: async (subscriptionEvent: TSubscriptionEvent<TPatientResource>, props: TDispatchProps<any>) => {
        ctx.log({ message: { patient: subscriptionEvent.resource.id }, v: '2020.02', fx: 'patientSub', type: 'backend-test' });
        console.log('ppiwpeipr', subscriptionEvent.resource)
        return { status: 200 };
      }
    }
  }
})

const ctx = createCtx({
  manifest,
})


const app = createApp({ ctx, helpers: {} });

startApp(app, parseInt(process.env.APP_PORT || '8080'));