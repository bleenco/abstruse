import { JobRun } from './model';
import { format } from 'date-fns';

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
      }).catch(err => reject(err));
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
      }).catch(err => reject(err));
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
      }).catch(err => reject(err));
  });
}

export function insertJobRun(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!data.log) {
      data.log = '';
    }
    data.log = data.log.replace(/\'/g, '');
    new JobRun(data).save(null, { method: 'insert' }).then(job => {
      if (!job) {
        reject(job);
      }

      resolve(job.toJSON());
    }).catch(err => reject(err));
  });
}

export function updateJobRun(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!data.log) {
      data.log = '';
    }
    data.log = data.log.replace(/\'/g, '');
    new JobRun({ id: data.id }).save(data, { method: 'update', require: false })
      .then(job => resolve(job.toJSON()))
      .catch(err => reject(err));
  });
}
