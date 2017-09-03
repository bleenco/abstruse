import { Job, JobRun } from './model';
import { getBuild } from './build';

export function getJob(jobId: number, userId?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job()
      .query(q => q.where('id', jobId))
      .fetch({ withRelated: [{'build.repository.permissions': (query) => {
        if (userId) {
          query.where('permissions.users_id', userId)
          .andWhere('permissions.permission', true)
          .orWhere('private', false);
        }
      }},
      'runs']})
      .then(job => {
        if (!job) {
          reject();
        }
        job = job.toJSON();
        job.hasPermission = false;
        if (job.build
          && job.build.reposiotory
          && job.build.repository.permissions
          && job.build.repository.permissions[0].permission) {
            job.hasPermission = true;
        }
        job.hasPermission = true;

        return job;
      })
      .then(job => {
        getBuild(job.builds_id)
          .then(build => {
            new JobRun()
              .query(q => {
                q.innerJoin('jobs', 'jobs.id', 'job_runs.job_id')
                .innerJoin('builds', 'jobs.builds_id', 'builds.id')
                .where('builds.repositories_id', build.repositories_id)
                .andWhere('jobs.id', '<=', job.id)
                .andWhere('job_runs.status', 'success')
                .andWhere('jobs.data', job.data)
                .whereNotNull('job_runs.start_time')
                .whereNotNull('job_runs.end_time')
                .orderBy('job_runs.id', 'desc');
              })
              .fetch()
              .then(lastJobRun => {
                if (lastJobRun) {
                  job.lastJob = lastJobRun.toJSON();
                }

                resolve(job);
              });
          });
      });
  });
}

export function getLastRunId(jobId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job({ id: jobId }).fetch({ withRelated: ['runs'] })
      .then(job => {
        if (!job) {
          reject();
        }
        const runs = job.related('runs').toJSON();

        resolve(runs.length > 0 ? runs[runs.length - 1].id : -1);
      });
  });
}

export function getLastRun(jobId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job({ id: jobId }).fetch({ withRelated: ['runs'] })
      .then(job => {
        if (!job) {
          reject();
        }
        const runs = job.related('runs').toJSON();

        resolve (runs[runs.length - 1]);
      });
  });
}

export function insertJob(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job(data).save(null, { method: 'insert' }).then(job => {
      if (!job) {
        reject();
      }

      resolve(job.toJSON());
    });
  });
}

export function updateJob(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job({ id: data.id }).save(data, { method: 'update', require: false })
      .then(job => resolve(job.toJSON()));
  });
}

export function resetJobs(buildId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = {
      start_time: new Date(),
      end_time: null,
      status: 'queued',
      log: ''
    };

    new Job().where({ builds_id: buildId }).save(data, { method: 'update', require: false })
      .then(jobs => !jobs ? reject() : resolve(jobs.toJSON()));
  });
}

export function resetJob(jobId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = {
      start_time: new Date(),
      end_time: null,
      status: 'queued',
      log: ''
    };

    new Job({ id: jobId }).save(data, { method: 'update', require: false })
      .then(job => resolve(job.toJSON()));
  });
}

export function getJobRepositoryId(jobId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job({ id: jobId }).fetch({ withRelated: ['build'] })
      .then(job => !job ? reject(job) : resolve(job.toJSON().build.repositories_id));
  });
}
