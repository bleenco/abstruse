import { Job, JobRun } from './model';
import { getBuild } from './build';

export function getJob(jobId: number, userId?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job()
      .query(q => {
        if (userId) {
          q.innerJoin('builds', 'builds.id', 'jobs.builds_id')
            .innerJoin('repositories', 'repositories.id', 'builds.repositories_id')
            .innerJoin('permissions', 'permissions.repositories_id', 'repositories.id')
            .where('permissions.users_id', userId)
            .andWhere(function () {
              this.where('permissions.permission', true).orWhere('repositories.public', true);
            });
        } else {
          q.innerJoin('builds', 'builds.id', 'jobs.builds_id')
            .innerJoin('repositories', 'repositories.id', 'builds.repositories_id')
            .where('repositories.public', true);
        }

        q.where('jobs.id', jobId);
      })
      .fetch({ withRelated: ['runs', 'build.repository.permissions'] })
      .then(job => {
        if (!job) {
          reject('Error while fetching job!');
        } else {
          const json = Object.assign({}, job.toJSON(), { hasPermission: true });
          resolve(json);
        }
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
