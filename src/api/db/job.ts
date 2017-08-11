import { Job, JobRun } from './model';
import { getBuild } from './build';

export function getJob(jobId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job({ id: jobId }).fetch({ withRelated: ['build.repository', 'runs'] })
      .then(job => {
        if (!job) {
          reject();
        }

        return job.toJSON();
      })
      .then(job => {
        getBuild(job.builds_id)
          .then(build => {
            new JobRun()
              .query(q => {
                q.innerJoin('jobs', 'jobs.id', 'job_runs.job_id')
                .innerJoin('builds', 'jobs.builds_id', 'builds.id')
                .where('builds.head_github_id', build.head_github_id)
                .andWhere('jobs.id', '<=', job.id)
                .andWhere('job_runs.status', 'success')
                .andWhere('jobs.test_script', job.test_script)
                .andWhere('jobs.language_version', job.language_version)
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

        resolve (runs[runs.length - 1].id);
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
      .then(jobs => {
        if (!jobs) {
          reject();
        } else {
          new Job().where({ builds_id: buildId }).fetchAll()
            .then(jobs => jobs ? resolve(jobs.toJSON()) : reject(jobs));
        }
    });
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
