import { JobRun } from './model';

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
  return new Promise((resolve, reject) => {
    new JobRun({ id: data.id }).save(data, { method: 'update', require: false })
      .then(job => resolve(job.toJSON()));
  });
}

export function resetJobRun(runId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = {
      start_time: new Date(),
      end_time: null,
      status: 'queued',
      log: '',
      id: runId
    };

    updateJobRun(data);
  });
}
