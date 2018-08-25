import * as express from 'express';
import * as dbJobRun from '../db/job-run';

export const statsRouter = express.Router();

statsRouter.get('/job-runs/:dateFrom/:dateTo', (req: express.Request, res: express.Response) => {
  dbJobRun.getJobRunsBetween(req.params.dateFrom, req.params.dateTo)
    .then(runs => res.status(200).json({ data: runs }))
    .catch(err => res.status(500).json({ data: err }));
});
