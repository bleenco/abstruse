import { BuildRun } from './model';

export function getRun(runId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new BuildRun({ id: runId }).fetch()
      .then(job => {
        if (!job) {
          reject();
        }

        resolve(job.toJSON());
      });
  });
}

export function insertBuildRun(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new BuildRun(data).save(null, { method: 'insert' }).then(job => {
      if (!job) {
        reject();
      }

      resolve(job.toJSON());
    });
  });
}

export function updateBuildRun(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new BuildRun({ id: data.id }).save(data, { method: 'update', require: false })
      .then(job => resolve(job.toJSON()));
  });
}
