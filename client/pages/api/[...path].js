const app = require('../../api-lib/app');

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default app;
