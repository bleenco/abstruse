import { Repository } from './model';

export function getRepositories(userId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    new Repository().fetchAll().then(repos => {
      if (!repos) {
        reject();
      }

      resolve(repos.toJSON());
    });
  });
}

export function addRepository(data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    new Repository(data).save().then(result => {
      if (!result) {
        reject();
      }

      resolve(true);
    }).catch(err => reject());
  });
}
