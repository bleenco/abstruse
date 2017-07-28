import { Build } from './model';

export function getBuilds(): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build().orderBy('id', 'DESC').fetchAll({ withRelated: ['repository', 'jobs'] })
      .then(builds => {
        if (!builds) {
          reject();
        }

        builds = builds.toJSON();
        builds = builds.map(build => {
          build.jobs = build.jobs.map(job => {
            delete job.log;
            return job;
          });

          return build;
        });

        resolve(builds);
      });
  });
}

export function getBuild(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build({ id: id }).fetch({ withRelated: ['repository', 'jobs'] }).then(build => {
      if (!build) {
        reject();
      }

      build = build.toJSON();
      build.jobs = build.jobs.map(job => {
        delete job.log;
        return job;
      });

      resolve(build);
    });
  });
}

export function insertBuild(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build().save(data, { method: 'insert' }).then(build => {
      if (!build) {
        reject(build);
      } else {
        resolve(build.toJSON());
      }
    }).catch(err => reject(err));
  });
}

export function updateBuild(data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    delete data.jobs;
    delete data.repository;

    new Build({ id: data.id }).save(data, { method: 'update', require: false }).then(build => {
      if (!build) {
        reject(build);
      } else {
        resolve(build.toJSON());
      }
    });
  });
}
