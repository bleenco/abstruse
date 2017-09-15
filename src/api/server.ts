import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { Observable } from 'rxjs';
import * as routes from './server-routes';
import { webhooks } from './webhooks';
import { yellow, cyan } from 'chalk';
import * as session from 'express-session';
import * as uuid from 'uuid';
import { logger, LogMessageType } from './logger';

export interface ServerConfig {
  port: number;
}

export interface IExpressServer {
  config: ServerConfig;
  start(): Observable<string>;
}

export const sessionParser = session({
  saveUninitialized: false,
  secret: 'sessionSecret',
  resave: false
});

export class ExpressServer implements IExpressServer {
  config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  start(): Observable<string> {
    return new Observable(observer => {
      const app: express.Application = express();
      app.use(cors());
      app.use(bodyParser.json());
      app.use(sessionParser);
      app.use('/webhooks', webhooks);
      app.use('/api/setup', routes.setupRoutes());
      app.use('/api/user', routes.userRoutes());
      app.use('/api/tokens', routes.tokenRoutes());
      app.use('/api/repositories', routes.repositoryRoutes());
      app.use('/api/builds', routes.buildRoutes());
      app.use('/api/jobs', routes.jobRoutes());
      app.use('/api/permissions', routes.permissionRoutes());
      app.use('/api/variables', routes.environmentVariableRoutes());
      app.use('/api/logs', routes.logsRoutes());
      app.use('/api/keys', routes.keysRoutes());
      app.use('/api/stats', routes.statsRoutes());
      app.use('/badge', routes.badgeRoutes());
      app.use(routes.webRoutes());


      app.listen(this.config.port, () => {
        const msg: LogMessageType = {
          message: `[http]: server running on port ${this.config.port}`,
          type: 'info',
          notify: false
        };
        logger.next(msg);
      });
    });
  }
}
