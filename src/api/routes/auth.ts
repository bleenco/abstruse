import * as express from 'express';
import { login } from '../db/user';

export const authRouter = express.Router();

authRouter.post('/login', (req: express.Request, res: express.Response) => {
  login(req.body)
    .then(credentials => res.status(200).json({ data: credentials }))
    .catch(err => res.status(500).json({ data: err }));
});
