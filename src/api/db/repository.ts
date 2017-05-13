import { Repository } from './model';

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
