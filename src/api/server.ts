import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { Observable } from 'rxjs';
import * as routes from './server-routes';

export interface ServerConfig {
  port: number;
}

export interface IExpressServer {
  config: ServerConfig;
  start(): Observable<string>;
}

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
      app.use('/api/setup', routes.setupRoutes());
      app.use('/api/user', routes.userRoutes());
      app.use('/api/repository', routes.repositoryRoutes());
      app.use(routes.webRoutes());
      app.listen(this.config.port, () => {
        observer.next(`Server running on port ${this.config.port}`);
      });
    });
  }
}
