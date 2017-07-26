import { Repository } from './model';
import { insertBuild, updateBuild } from './build';
import { getHttpJsonResponse } from '../utils';

export function getRepository(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository({ id: id }).fetch({
      withRelated: ['builds.repository', 'builds.jobs']
    }).then(repo => {
      if (!repo) {
        reject(repo);
      } else {
        resolve(repo.toJSON());
      }
    }).catch(err => reject(err));
  });
}

export function getRepositoryOnly(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository({ id: id }).fetch().then(repo => {
      if (!repo) {
        reject(repo);
      } else {
        resolve(repo.toJSON());
      }
    }).catch(err => reject(err));
  });
}

export function getRepositoryByBuildId(buildId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository().query(qb => {
      qb.leftJoin('builds', 'repositories.id', 'builds.repositories_id');
      qb.where('builds.id', '=', buildId);
    }).fetch().then(repo => {
      if (!repo) {
        reject();
      } else {
        resolve(repo.toJSON());
      }
    });
  });
}

export function getRepositories(userId: string): Promise<any[]> {
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
    new Repository().save(data, { method: 'insert' }).then(result => {
      if (!result) {
        reject(result);
      } else {
        resolve(result.toJSON());
      }
    }).catch(err => reject(err));
  });
}

// ping repository
export function pingRepository(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository().where({ github_id: data.github_id }).fetch()
      .then(repo => {
        if (!repo) {
          new Repository().save(data, { method: 'insert' })
            .then(result => {
              if (!result) {
                reject(result);
              } else {
                resolve(result.toJSON());
              }
            })
            .catch(err => reject(err));
        } else {
          repo.save(data, { method: 'update' })
            .then(result => {
              if (!result) {
                reject(result);
              } else {
                resolve(result.toJSON());
              }
            })
            .catch(err => reject(err));
        }
      });
  });
}

export function createPullRequest(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let buildData = null;

    new Repository().where({ github_id: data.base.repo.id }).fetch()
      .then(repo => {
        if (!repo) {
          return Promise.resolve(repo);
        } else {
          return Promise.resolve(repo.toJSON());
        }
      })
      .then(repoData => {
        if (!repoData) {
          repoData = {
            github_id: data.base.repo.id,
            clone_url: data.base.repo.clone_url,
            html_url: data.base.repo.html_url,
            default_branch: data.base.repo.default_branch,
            name: data.base.repo.name,
            full_name: data.base.repo.full_name,
            description: data.base.repo.description,
            private: data.base.repo.private,
            fork: data.base.repo.fork,
            user_login: data.base.user.login,
            user_id: data.base.user.id,
            user_avatar_url: data.base.user.avatar_url,
            user_url: data.base.user.url,
            user_html_url: data.base.user.html_url,
            head_github_id: data.head.repo.id,
            head_clone_url: data.head.repo.clone_url,
            head_html_url: data.head.repo.html_url,
            head_default_branch: data.head.repo.default_branch,
            head_name: data.head.repo.name,
            head_full_name: data.head.repo.full_name,
            head_description: data.head.repo.description,
            head_private: data.head.repo.private,
            head_fork: data.head.repo.fork,
            head_user_login: data.head.user.login,
            head_user_id: data.head.user.id,
            head_user_avatar_url: data.head.user.avatar_url,
            head_user_url: data.head.user.url,
            head_user_html_url: data.head.user.html_url,
          };

          return addRepository(repoData);
        } else {
          return Promise.resolve(repoData);
        }
      })
      .then(repo => {
        buildData = {
          pr: data.number,
          label: data.base.label,
          ref: data.base.ref,
          sha: data.base.sha,
          head_label: data.head.label,
          head_ref: data.head.ref,
          head_sha: data.head.sha,
          message: data.title,
          start_time: new Date(),
          repositories_id: repo.id
        };

        return getHttpJsonResponse(repo.head_user_url);
      })
      .then(userData => {
        buildData.author = userData.name;
        resolve(buildData);
      })
      .catch(err => reject(err));
  });
}
