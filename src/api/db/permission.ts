import { Permission } from './model';
import { getUsers } from './user';

export function getPermission(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Permission({ id: id }).fetch()
      .then(permission => !permission ? reject(permission) : resolve(permission.toJSON()));
  });
}

export function getRepositoryPermissions(repoId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Permission({ repositories_id: repoId }).fetchAll()
    .then(permissions => !permissions ? reject(permissions) : resolve(permissions.toJSON()));
  });
}

export function updatePermission(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Permission({ id: data.id }).save(data, { method: 'update', require: false })
      .then(permission => !permission ? reject(permission) : resolve(permission.toJSON()));
  });
}

export function addPermission(data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    new Permission(data).save(null, { method: 'insert' })
      .then(permission => !permission ? reject() : resolve(permission.toJSON()));
  });
}

export function addRepositoryPermissionToEveryone(repoId): Promise<any> {
  return new Promise ((resolve, reject) => {
    getUsers().then(users => {
      return Promise.all(users.map(user => addPermission({
        repositories_id: repoId,
        users_id: user.id
      })))
      .then(() => resolve());
    }).catch(err => reject(err));
  });
}
