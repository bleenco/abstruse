import { getBuildRepositoryId } from './build';
import { getJobRepositoryId } from './job';
import { Permission, Repository } from './model';
import { getRepositories } from './repository';
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

export function getUserRepositoryPermissions(repoId: number, userId?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    if (userId) {
      new Permission({ repositories_id: repoId, users_id: userId })
      .fetch({ withRelated: ['repository'] })
      .then(permission => {
        if (permission) {
          permission = permission.toJSON();
          permission.repository.public ? resolve(true) : resolve(permission.permission);
        }

        reject(permission);
      });
    } else {
      new Repository({ id: repoId }).fetch().then(repo => {
        if (!repo) {
          reject(repo);
        }

        repo = repo.toJSON();
        resolve(repo.public);
      });
    }
  });
}

export function getUserBuildPermissions(buildId: number, userId?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    getBuildRepositoryId(buildId)
      .then(repoId => {
        if (userId) {
          resolve(getUserRepositoryPermissions(repoId, userId));
        }
        resolve(getUserRepositoryPermissions(repoId));
      })
      .catch(() => resolve(false));
  });
}

export function getUserJobPermissions(jobId: number, userId?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    getJobRepositoryId(jobId)
      .then(repoId => {
        if (userId) {
          resolve(getUserRepositoryPermissions(repoId, userId));
        }
        resolve(getUserRepositoryPermissions(repoId));
      })
      .catch(() => resolve(false));
  });
}

export function updatePermission(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let updateData = {
      repositories_id: data.repository, users_id: data.user, permission: data.permission };
    new Permission()
      .query(q => q.where('repositories_id', data.repository).andWhere('users_id', data.user))
      .save(updateData, { method: 'update', require: false })
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

export function addRepositoryPermissions(userId): Promise<any> {
  return new Promise ((resolve, reject) => {
    getRepositories('').then(repositories => {
      return Promise.all(repositories.map(repo => addPermission({
        repositories_id: repo.id,
        users_id: userId
      })))
      .then(() => resolve());
    }).catch(err => reject(err));
  });
}
