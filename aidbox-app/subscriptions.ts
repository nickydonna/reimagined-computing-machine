import { TSubscription } from "./helpers";
import axios from 'axios'

export const Patient: TSubscription<any> = {
  handler: "Patient",
  handlerFn: async (event, { ctx, helpers }) => {
    const { resource: patient, previous } = event;
    console.log('Handling subscription "Patient"');
    console.log({ patient, previous });

    await axios.post('https://webhook.site/0b40fddb-7260-4a05-b38d-b51d61eeeae4', patient)

    return { status: 500 };
  },
};