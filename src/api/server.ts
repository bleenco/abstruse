import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { Observable } from 'rxjs';
import * as routes from './server-routes';
import { webhooks } from './webhooks';
import * as session from 'express-session';
import { getRootDir } from './setup';
import * as connectsqlite3 from 'connect-sqlite3';

import { setupRouter } from './routes/setup';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';

const SQLiteStore = connectsqlite3(session);

export interface ServerConfig {
  port: number;
}

export interface IExpressServer {
  config: ServerConfig;
  start(): Observable<express.Application>;
}

export const sessionParser = session({
  store: new SQLiteStore({ dir: getRootDir() }),
  saveUninitialized: false,
  secret: 'sessionSecret',
  resave: false
});

export class ExpressServer implements IExpressServer {
  config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  start(): Observable<express.Application> {
    return new Observable(observer => {
      const app: express.Application = express();
      app.use(cors());
      app.use(bodyParser.json());
      app.use('/webhooks', webhooks);
      app.use('/api/setup', setupRouter);
      app.use('/api/auth', authRouter);
      app.use('/api/users', usersRouter);

      app.use('/api/user', routes.userRoutes());
      app.use('/api/tokens', routes.tokenRoutes());
      app.use('/api/repositories', routes.repositoryRoutes());
      app.use('/api/builds', routes.buildRoutes());
      app.use('/api/jobs', routes.jobRoutes());
      app.use('/api/permissions', routes.permissionRoutes());
      app.use('/api/variables', routes.environmentVariableRoutes());
      app.use('/api/logs', routes.logsRoutes());
      app.use('/api/keys', routes.keysRoutes());
      app.use('/api/config', routes.configRoutes());
      app.use('/api/stats', routes.statsRoutes());
      app.use('/api/images', routes.imagesRoutes());
      app.use('/badge', routes.badgeRoutes());
      app.use(routes.webRoutes());

      observer.next(app);
    });
  }
}
