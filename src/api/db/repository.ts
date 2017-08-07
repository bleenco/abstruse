import { Repository } from './model';
import { insertBuild, updateBuild } from './build';
import { getHttpJsonResponse } from '../utils';

export function getRepository(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository({ id: id })
      .fetch({
        withRelated: [
          { 'builds': (query) => {
              query.orderBy('id', 'desc');
            }
          },
          'builds.repository',
          'builds.jobs'
        ]
      } as any)
      .then(repo => {
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

export function getRepositoryBadge(id: number): Promise<string> {
  return new Promise((resolve, reject) => {
    new Repository({ id: id })
      .fetch({
        withRelated: [
          { 'builds': query => query.where('pr', null).orderBy('id', 'desc').limit(1) },
          'builds.jobs'
        ]
      } as any)
      .then(repo => {
        if (!repo) {
          resolve('unknown');
        } else {
          repo = repo.toJSON();
          let status = 'queued';

          if (repo.builds[0] && repo.builds[0].jobs) {
            if (repo.builds[0].jobs.findIndex(job => job.status === 'failed') !== -1) {
              status = 'failing';
            }

            if (repo.builds[0].jobs.findIndex(job => job.status === 'running') !== -1) {
              status = 'running';
            }

            if (repo.builds[0].jobs.length ===
                repo.builds[0].jobs.filter(job => job.status === 'success').length) {
              status = 'passing';
            }
          }

          resolve(status);
        }
      });
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

export function getRepositories(userId: string, keyword: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    new Repository().query(qb => {
      if (keyword !== '') {
        qb.where('full_name', 'like', `%${keyword}%`).orWhere('clone_url', 'like', `%${keyword}%`);
      }
    }).fetchAll().then(repos => {
      if (!repos) {
        reject();
      }

      resolve(repos.toJSON());
    });
  });
}

export function addRepository(data: any): Promise<any> {
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

export function updateRepository(data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    new Repository().where({ github_id: data.github_id })
      .save(data, { method: 'update', require: false }).then(result => {
        if (!result) {
          reject(result);
        } else {
          resolve(result.toJSON());
        }
      }).catch(err => reject(err));
  });
}

export function pingRepository(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    data = {
      github_id: data.repository.id,
      clone_url: data.repository.clone_url,
      html_url: data.repository.html_url,
      default_branch: data.repository.default_branch,
      name: data.repository.name,
      full_name: data.repository.full_name,
      description: data.repository.description,
      private: data.repository.private,
      fork: data.repository.fork,
      user_login: data.repository.owner.login,
      user_id: data.repository.owner.id,
      user_avatar_url: data.repository.owner.avatar_url,
      user_url: data.repository.owner.url,
      user_html_url: data.repository.owner.html_url
    };

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
          repo.save(data, { method: 'update', require: false })
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
            user_html_url: data.base.user.html_url
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
          start_time: new Date(),
          repositories_id: repo.id
        };

        return getHttpJsonResponse(data.head.user.url);
      })
      .then(userData => {
        buildData.author = userData.name;
        resolve(buildData);
      })
      .catch(err => reject(err));
  });
}

export function synchronizePullRequest(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let repo = null;
    let buildData = null;

    new Repository().where({ github_id: data.base.repo.id }).fetch()
      .then(repository => {
        if (!repository) {
          return addRepository({
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
            user_html_url: data.base.user.html_url
          })
          .then(addedRepo => repo = addedRepo);
        } else {
          repo = repository.toJSON();
          return Promise.resolve(repository.toJSON());
        }
      })
      .then(repoData => {
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
          user_html_url: data.base.user.html_url
        };

        return updateRepository(repoData);
      })
      .then(() => {
        buildData = {
          pr: data.number,
          label: data.base.label,
          ref: data.base.ref,
          sha: data.base.sha,
          head_label: data.head.label,
          head_ref: data.head.ref,
          head_sha: data.head.sha,
          message: data.title,
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
          start_time: new Date(),
          repositories_id: repo.id
        };

        return getHttpJsonResponse(data.head.user.url);
      })
      .then(userData => {
        buildData.author = userData.name;
        resolve(buildData);
      })
      .catch(err => reject(err));
  });
}
