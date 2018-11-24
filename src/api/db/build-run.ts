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
    delete data.branch;
    delete data.parsed_config;
    data.head_id = data.data && data.data.repository && data.data.repository.id || null;
    delete data.data;

    new BuildRun().save(data, { method: 'insert' }).then(buildRun => {
      if (!buildRun) {
        reject(buildRun);
      } else {
        resolve(buildRun.toJSON());
      }
    }).catch(err => reject(err));
  });
}

export function updateBuildRun(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new BuildRun({ id: data.id }).save(data, { method: 'update', require: false })
      .then(job => resolve(job.toJSON()))
      .catch(err => reject(err));
  });
}
