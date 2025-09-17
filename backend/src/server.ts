import { app } from './app';
import { env } from './utils/env';
app.listen(Number(env.PORT), () =>
  console.log(`🚀 http://localhost:${env.PORT}`)
);
