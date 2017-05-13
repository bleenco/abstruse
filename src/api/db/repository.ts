import { Repository } from './model';

export function getRepository(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository({ id: id }).fetch().then(repo => {
      if (!repo) {
        reject();
      }

      resolve(repo.toJSON());
    });
  });
}

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
