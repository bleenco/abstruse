import { Build, BuildRun, Job } from './model';
import { getLastRun } from './job';

export function getBuilds(
  limit: number,
  offset: number,
  filter: string,
  userId?: number | null
): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build()
      .query(q => {
        if (userId) {
          q.innerJoin('repositories', 'repositories.id', 'builds.repositories_id')
          .innerJoin('permissions', 'permissions.repositories_id', 'repositories.id')
          .where('permissions.users_id', userId)
          .andWhere(function() {
            this.where('permissions.permission', true).orWhere('repositories.private', false);
          });
        } else {
          q.innerJoin('repositories', 'repositories.id', 'builds.repositories_id')
          .where('repositories.private', false)
          .andWhere('repositories.public', true);
        }

        if (filter === 'pr') {
          q.whereNotNull('builds.pr');
        } else if (filter === 'commits') {
          q.whereNull('builds.pr');
        }

        q.orderBy('id', 'DESC')
        .offset(offset)
        .limit(limit);
      })
      .fetchAll({ withRelated: ['repository.permissions', 'jobs.runs' ]})
      .then(builds => {
        if (!builds) {
          reject();
        }

        builds = builds.toJSON();
        builds = builds.map(build => {
          build.jobs = build.jobs.map(job => {
            if (job.runs.length > 0) {
              job.end_time = job.runs[job.runs.length - 1].end_time;
              job.start_time = job.runs[job.runs.length - 1].start_time;
              job.status = job.runs[job.runs.length - 1].status;
            }

            return job;
          });

          build.hasPermission = build.repository.permissions &&
            build.repository.permissions[0].permission;

          return build;
        });

        resolve(builds);
      });
  });
}

export function getBuild(id: number, userId?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build()
      .query(q => q.where('id', id))
      .fetch({ withRelated: [{'repository.permissions': (query) => {
            if (userId) {
              query.where('permissions.users_id', userId)
              .andWhere('permissions.permission', true)
              .orWhere('private', false);
            }
          }
        },
        'repository.access_token',
        'jobs.runs',
        'runs.job_runs']
      })
      .then(build => {
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

        build.runs = build.runs.map(run => {
          if (run.job_runs) {
            if (run.job_runs.findIndex(j => j.status === 'queued') !== -1) {
              run.status = 'queued';
            } else if (run.job_runs.findIndex(j => j.status === 'running') !== -1) {
              run.status = 'running';
            } else if (run.job_runs.findIndex(j => j.status === 'failed') !== -1) {
              run.status = 'failed';
            } else if (run.job_runs.findIndex(j => j.status === 'success') !== -1) {
              run.status = 'success';
            }
          }

          return run;
        });

        if (build.repository.access_token && build.repository.access_token) {
          build.repository.access_token = build.repository.access_token.token;
        } else {
          build.repository.access_token = null;
        }

        build.hasPermission = build.repository.permissions &&
          build.repository.permissions[0].permission;

        return build;
      })
      .then(build => {
        new BuildRun()
          .query(q => {
            q.innerJoin('builds', 'builds.id', 'build_runs.build_id')
            .where('builds.repositories_id', build.repositories_id)
            .andWhere('builds.id', '<=', build.id)
            .whereNotNull('build_runs.start_time')
            .whereNotNull('build_runs.end_time')
            .orderBy('build_runs.id', 'desc');
          })
          .fetch()
          .then(lastBuild => {
            if (lastBuild) {
              build.lastBuild = lastBuild.toJSON();
            }

            resolve(build);
          });
      });
  });
}

export function getLastBuild(userId?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build().query(q => q.orderBy('id', 'desc'))
    .fetch({ withRelated: [{'repository.permissions': (query) => {
          if (userId) {
            query.where('permissions.users_id', userId)
            .andWhere('permissions.permission', true)
            .orWhere('private', false);
          }
        }
      },
      'jobs.runs']})
    .then(build => {
      if (!build) {
        reject(build);
      }

      build = build.toJSON();
      build.jobs = build.jobs.map(job => {
        if (job.runs.length > 0) {
          job.end_time = job.runs[job.runs.length - 1].end_time;
          job.start_time = job.runs[job.runs.length - 1].start_time;
          job.status = job.runs[job.runs.length - 1].status;
        }

        return job;
      });

      build.hasPermission = build.repository.permissions &&
        build.repository.permissions[0].permission;

      resolve(build);
    });
  });
}

export function getLastRunId(buildId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build({ id: buildId }).fetch({ withRelated: ['runs'] })
      .then(build => {
        if (!build) {
          reject();
        }
        const runs = build.related('runs').toJSON();

        resolve(runs.length > 0 ? runs[runs.length - 1].id : -1);
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
    delete data.runs;
    delete data.hasPermission;

    new Build({ id: data.id }).save(data, { method: 'update', require: false }).then(build => {
      if (!build) {
        reject(build);
      } else {
        resolve(build.toJSON());
      }
    });
  });
}

export function getBuildStatus(buildId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job()
      .query(q => q.where('builds_id', buildId))
      .fetchAll()
      .then(jobs => {
        Promise.all(jobs.map(j => getLastRun(j.id).then(r => r.status === 'success')))
          .then(data => resolve(data.reduce((curr, prev) => !curr ? curr : prev)));
      });
    });
}
