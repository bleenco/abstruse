import { EnvironmentVariable } from './model';
import { encrypt } from '../security';

export function insertEnvironmentVariable(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (data.encrypted) {
      try {
        data.value = encrypt(data.value);
      } catch (e) { }
    }

    new EnvironmentVariable().save(data, { method: 'insert' })
      .then(buildRun => !buildRun ? reject() : resolve(buildRun.toJSON()));
  });
}

export function removeEnvironmentVariable(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new EnvironmentVariable({ id: id }).destroy()
      .then(() => resolve(true))
      .catch(() => reject());
  });
}
