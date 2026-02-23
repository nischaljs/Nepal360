import { env } from './config/env';
import app from './app';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
