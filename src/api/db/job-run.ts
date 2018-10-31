import { format } from 'date-fns';

import { JobRun } from './model';

export function getJobRuns(): Promise<any> {
  return new Promise((resolve, reject) => {
    new JobRun().fetchAll()
      .then(jobRuns => {
        if (!jobRuns) {
          reject(jobRuns);
        } else {
          let runs = jobRuns.toJSON();
          runs = runs.filter(run => run.status === 'success' || run.status === 'failed')
          .reduce((acc, curr) => {
            const time = format(new Date(curr.created_at), 'YYYY-MM-DD');
            const status = curr.status;

            if (!acc[status][time]) {
              acc[status][time] = 1;
            } else {
              acc[status][time] += 1;
            }

            return acc;
          }, { success: {}, failed: {} });

          resolve(runs);
        }
      });
  });
}

export function getJobRunsBetween(dateFrom: string, dateTo: string): Promise<any> {
  return new Promise((resolve, reject) => {
    new JobRun()
      .query(qb => {
        qb.where('job_runs.start_time', '>=', new Date(dateFrom));
        qb.andWhere('job_runs.end_time', '<=', new Date(dateTo));
      })
      .fetchAll()
      .then(jobRuns => {
        if (!jobRuns) {
          reject(jobRuns);
        } else {
          let runs = jobRuns.toJSON();
          runs = runs.filter(run => run.status === 'success' || run.status === 'failed')
          .reduce((acc, curr) => {
            const time = format(new Date(curr.created_at), 'YYYY-MM-DD');
            const status = curr.status;

            if (!acc[status][time]) {
              acc[status][time] = 1;
            } else {
              acc[status][time] += 1;
            }

            return acc;
          }, { success: {}, failed: {} });

          resolve(runs);
        }
      });
  });
}

export function getRun(runId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new JobRun({ id: runId }).fetch()
      .then(job => {
        if (!job) {
          reject();
        }

        resolve(job.toJSON());
      });
  });
}

export function insertJobRun(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new JobRun(data).save(null, { method: 'insert' }).then(job => {
      if (!job) {
        reject();
      }

      resolve(job.toJSON());
    });
  });
}

export function updateJobRun(data: any): Promise<any> {
  return new Promise((resolve) => {
    new JobRun({ id: data.id }).save(data, { method: 'update', require: false })
      .then(job => resolve(job.toJSON()));
  });
}
