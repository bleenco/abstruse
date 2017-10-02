import { Build, BuildRun, Job, JobRun } from './model';
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
            this.where('permissions.permission', true).orWhere('repositories.public', true);
          });
        } else {
          q.innerJoin('repositories', 'repositories.id', 'builds.repositories_id')
          .where('repositories.public', true);
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

          userId = parseInt(<any>userId, 10);
          if (build.repository.permissions && build.repository.permissions.length) {
            let index = build.repository.permissions.findIndex(p => p.users_id === userId);
            if (index !== -1 && build.repository.permissions[index].permission) {
              build.hasPermission = true;
            } else {
              build.hasPermission = false;
            }
          } else {
            build.hasPermission = false;
          }

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
              .orWhere('public', true);
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

        userId = parseInt(<any>userId, 10);
        if (build.repository.permissions && build.repository.permissions.length) {
          let index = build.repository.permissions.findIndex(p => p.users_id === userId);
          if (index !== -1 && build.repository.permissions[index].permission) {
            build.hasPermission = true;
          } else {
            build.hasPermission = false;
          }
        } else {
          build.hasPermission = false;
        }

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
          .fetch({ withRelated: 'job_runs'})
          .then(lastBuild => {
            if (lastBuild) {
              build.lastBuild = lastBuild.toJSON();
            }

            build.jobs = build.jobs.map(job => {
              job.data = JSON.parse(job.data);
              return job;
            });
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
            .orWhere('public', true);
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

      userId = parseInt(<any>userId, 10);
      if (build.repository.permissions && build.repository.permissions.length) {
        let index = build.repository.permissions.findIndex(p => p.users_id === userId);
        if (index !== -1 && build.repository.permissions[index].permission) {
          build.hasPermission = true;
        } else {
          build.hasPermission = false;
        }
      } else {
        build.hasPermission = false;
      }

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

export function getBuildRepositoryId(buildId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build({ id: buildId }).fetch()
    .then(build => !build ? reject(build) : resolve(build.toJSON().repositories_id));
  });
}

export function getBuildStatus(buildId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job()
      .query(q => q.where('builds_id', buildId))
      .fetchAll()
      .then(jobs => {
        Promise.all(jobs.map(j => getLastRun(j.id).then(r => r.status)))
          .then(data => resolve(data.reduce((accu, curr) => {
            if (curr === 'queued') {
              return curr;
            } else if (curr === 'running' && accu !== 'queued') {
              return curr;
            } else if (curr === 'failed' && accu !== 'running' && accu !== 'queued') {
              return curr;
            } else if (curr === 'success' && accu !== 'failed'
              && accu !== 'running' && accu !== 'queued') {
                return curr;
            }

            return accu;
          })));
      });
    });
}

export function getDepracatedBuilds(build: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build({ repositories_id: build.repositories_id })
    .query(q => {
      q.whereNull('end_time')
      .andWhereNot('id', build.id);

      if (build.pr) {
        q.where('pr', build.pr);
      }
    })
    .fetchAll()
    .then(builds => {
      if (!builds) {
        reject();
      }

      builds = builds.toJSON();
      if (!build.pr) {
        builds = builds.filter(b => {
          if (build.data.before) {
            return build.data.before === b.data.before;
          } else if (build.data.before_sha) {
            return build.data.before_sha === b.data.before_sha;
          } else if (build.data.object_attributes && build.data.object_attributes.before_sha) {
            return build.data.object_attributes.before_sha
              === b.data.object_attributes.before_sha;
          }

          return false;
        });
      }
      builds = builds.map(b => b.id);

      resolve(builds);
    });
  });
}
