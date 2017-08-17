import { BuildRun } from './model';

export function getRun(runId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new BuildRun({ id: runId }).fetch()
      .then(buildRun => {
        if (!buildRun) {
          reject();
        }

        resolve(buildRun.toJSON());
      });
  });
}

export function insertBuildRun(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    delete data.id;
    delete data.repositories_id;
    delete data.jobs;
    delete data.pr;

    new BuildRun().save(data, { method: 'insert' }).then(buildRun => {
      if (!buildRun) {
        reject();
      }

      resolve(buildRun.toJSON());
    });
  });
}

export function updateBuildRun(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new BuildRun({ id: data.id }).save(data, { method: 'update', require: false })
      .then(job => resolve(job.toJSON()));
  });
}
