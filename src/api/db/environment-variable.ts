import { encrypt } from '../security';
import { EnvironmentVariable } from './model';

export async function insertEnvironmentVariable(data: any): Promise<any> {
  if (data.encrypted) {
    try {
      data.value = encrypt(data.value);
    } catch (e) { }
  }

  const buildRun = await new EnvironmentVariable().save(data, { method: 'insert' });

  if (!buildRun) {
    throw buildRun;
  }

  return buildRun.toJSON();
}

export async function removeEnvironmentVariable(id: number): Promise<any> {
  await new EnvironmentVariable({ id: id }).destroy();
  return true;
}
