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
          .orWhere('public', true);
        }
      }}, 'runs']})
      .then(job => {
        if (!job) {
          reject();
        }
        job = job.toJSON();

        userId = parseInt(<any>userId, 10);
        if (job.build
          && job.build.repository
          && job.build.repository.permissions
          && job.build.repository.permissions.length) {
            let index = job.build.repository.permissions.findIndex(p => p.users_id === userId);
            if (index !== -1 && job.build.repository.permissions[index].permission) {
              job.hasPermission = true;
            } else {
              job.hasPermission = false;
            }
        } else {
          job.hasPermission = false;
        }

        resolve(job);
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
