import { Build, BuildRun } from './model';

export function getBuilds(limit: number, offset: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build()
      .query(q => q.orderBy('id', 'DESC').offset(offset).limit(limit))
      .fetchAll({ withRelated: ['repository', 'jobs.runs'] })
      .then(builds => {
        if (!builds) {
          reject();
        }

        builds = builds.toJSON();
        builds = builds.map(build => {
          build.jobs = build.jobs.map(job => {
            job.end_time = job.runs[job.runs.length - 1].end_time;
            job.start_time = job.runs[job.runs.length - 1].start_time;
            job.status = job.runs[job.runs.length - 1].status;
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
    new Build({ id: id }).fetch({ withRelated: ['repository', 'jobs.runs'] }).then(build => {
      if (!build) {
        reject();
      }

      build = build.toJSON();
      build.jobs = build.jobs.map(job => {
        job.end_time = job.runs[job.runs.length - 1].end_time;
        job.start_time = job.runs[job.runs.length - 1].start_time;
        job.status = job.runs[job.runs.length - 1].status;
        return job;
      });

      return build;
    })
    .then(build => {
      new BuildRun()
        .query(q => {
          q.innerJoin('builds', 'builds.id', 'build_runs.build_id')
          .where('builds.head_github_id', build.head_github_id)
          .andWhere('builds.id', '<=', build.id)
          .whereNotNull('build_runs.start_time')
          .whereNotNull('build_runs.end_time')
          .orderBy('build_runs.id', 'desc');
        })
        .fetch()
        .then(lastBuild => {
          build.lastBuild = lastBuild;

          resolve(build);
        });
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
    delete data.lastBuild;

    new Build({ id: data.id }).save(data, { method: 'update', require: false }).then(build => {
      if (!build) {
        reject(build);
      } else {
        resolve(build.toJSON());
      }
    });
  });
}
