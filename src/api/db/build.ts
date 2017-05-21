import { Build } from './model';

export function getBuilds(): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build().orderBy('id', 'DESC').fetchAll({ withRelated: ['repository'] }).then(builds => {
      if (!builds) {
        reject();
      }

      resolve(builds.toJSON());
    });
  });
}

export function getBuild(uuid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build({ uuid: uuid }).fetch({ withRelated: ['repository'] }).then(build => {
      if (!build) {
        reject();
      }

      resolve(build.toJSON());
    });
  });
}

export function insertBuild(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    data.start_time = new Date();

    new Build(data).save(null, { method: 'insert' }).then(build => {
      if (!build) {
        reject();
      }

      resolve(build);
    });
  });
}

export function updateBuild(data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    new Build({ id: data.id }).save(data, { method: 'update' }).then(build => {
      if (!build) {
        reject();
      }

      resolve(true);
    });
  });
}
