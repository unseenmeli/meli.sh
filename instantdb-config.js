import { init } from "@instantdb/core";

const APP_ID = "422149f2-6c2a-411b-8c09-3d876245d7b6";

const db = init({ appId: APP_ID });

const schema = {
  comments: {
    page: "string",
    text: "string",
    timestamp: "string",
  },
};

export { db, schema };
