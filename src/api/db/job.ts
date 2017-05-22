import { Job } from './model';

export function getJobs(buildId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job({ builds_id: buildId }).fetchAll().then(jobs => {
      if (!jobs) {
        reject();
      }

      resolve(jobs.toJSON());
    });
  });
}

export function getJob(jobId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Job({ id: jobId }).fetch().then(job => {
      if (!job) {
        reject();
      }

      resolve(job.toJSON());
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
    new Job({ id: data.id }).save(data, { method: 'update' }).then(job => {
      if (!job) {
        reject();
      }

      resolve(job.toJSON());
    });
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

    new Job({ builds_id: buildId }).save(data, { method: 'update' }).then(jobs => {
      if (!jobs) {
        reject();
      }

      resolve(jobs.toJSON());
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

    new Job({ id: jobId }).save(data, { method: 'update' }).then(job => {
      if (!job) {
        reject();
      }

      getJob(jobId).then(job => resolve(job));
    });
  });
}
