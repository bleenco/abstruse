import { Job } from './model';

export function getJob(jobId: number, buildId?: number, userId?: number): Promise<any> {
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

        if (buildId) {
          q.andWhere('jobs.id', jobId).andWhere('jobs.builds_id', buildId);
        } else {
          q.andWhere('jobs.id', jobId);
        }
      })
      .fetch({ withRelated: ['build.repository.permissions', 'runs'] })
      .then(job => {
        if (!job) {
          reject();
        }
        job = job.toJSON();

        userId = Number(userId);
        if (job.build
          && job.build.repository
          && job.build.repository.permissions
          && job.build.repository.permissions.length) {
          const index = job.build.repository.permissions.findIndex(p => p.users_id === userId);
          if (index !== -1 && job.build.repository.permissions[index].permission) {
            job.hasPermission = true;
          } else {
            job.hasPermission = false;
          }
        } else {
          job.hasPermission = false;
        }

        resolve(job);
      })
      .catch(err => reject(err));
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
      })
      .catch(err => reject(err));
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

        resolve(runs[runs.length - 1]);
      })
      .catch(err => reject(err));
  });
}

export function insertJob(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job(data).save(null, { method: 'insert' }).then(job => {
      if (!job) {
        reject();
      }

      resolve(job.toJSON());
    })
      .catch(err => reject(err));
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
      .then(jobs => !jobs ? reject() : resolve(jobs.toJSON()))
      .catch(err => reject(err));
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
      .then(job => resolve(job.toJSON()))
      .catch(err => reject(err));
  });
}

export function getJobRepositoryId(jobId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job({ id: jobId }).fetch({ withRelated: ['build'] })
      .then(job => !job ? reject(job) : resolve(job.toJSON().build.repositories_id))
      .catch(err => reject(err));
  });
}
