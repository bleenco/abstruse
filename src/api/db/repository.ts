import { Repository } from './model';
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
          { 'builds.runs': query => query.orderBy('id', 'desc').limit(1) },
          'builds.runs.job_runs'
        ]
      } as any)
      .then(repo => {
        if (!repo) {
          resolve('unknown');
        } else {
          repo = repo.toJSON();
          let status = 'queued';

          if (repo.builds[0] &&  repo.builds[0].runs[0]) {
            if (repo.builds[0].runs[0].job_runs.findIndex(run => run.status === 'failed') !== -1) {
              status = 'failing';
            }

            if (repo.builds[0].runs[0].job_runs.findIndex(run => run.status === 'running') !== -1) {
              status = 'running';
            }

            if (repo.builds[0].runs[0].job_runs.length ===
              repo.builds[0].runs[0].job_runs.filter(run => run.status === 'success').length) {
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

export function getRepositoryId(owner: string, repository: string): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository().query(q => q.where('full_name', `${owner}/${repository}`))
    .fetch().then(repo => !repo ? reject() : resolve(repo.toJSON().id));
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
    const saveData = generateRepositoryData(data);
    new Repository().where({ github_id: saveData.github_id }).fetch()
      .then(repo => {
        if (!repo) {
          new Repository().save(saveData, { method: 'insert' })
            .then(result => {
              if (!result) {
                reject(result);
              } else {
                resolve(result.toJSON());
              }
            })
            .catch(err => reject(err));
        } else {
          repo.save(saveData, { method: 'update', require: false })
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
    const ghid = data.base ? data.base.repo.id : data.pull_request.base.repo.id;
    new Repository().where({ github_id: ghid }).fetch()
      .then(repo => {
        if (!repo) {
          return Promise.resolve(repo);
        } else {
          return Promise.resolve(repo.toJSON());
        }
      })
      .then(repoData => {
        if (!repoData) {
          const repoData = generateRepositoryData(data);
          return addRepository(repoData);
        } else {
          return Promise.resolve(repoData);
        }
      })
      .then(repo => {
        const buildData = {
          pr: data.number,
          data: data,
          start_time: new Date(),
          repositories_id: repo.id
        };

        resolve(buildData);
      })
      .catch(err => reject(err));
  });
}

export function synchronizePullRequest(data: any): Promise<any> {
  let repoId;
  return new Promise((resolve, reject) => {
    const ghid = data.base ? data.base.repo.id : data.pull_request.base.repo.id;
    new Repository().where({ github_id: ghid }).fetch()
      .then(repository => {
        if (!repository) {
          const repoData = generateRepositoryData(data);
          return addRepository(repoData).then(repo => {
            repoId = repo.id;
          });
        } else {
          const repoJson = repository.toJSON();
          repoId = repoJson.id;
          return Promise.resolve();
        }
      })
      .then(() => {
        const repoData = generateRepositoryData(data);
        return updateRepository(repoData);
      })
      .then(() => {
        const buildData = {
          pr: data.pull_request.number,
          data: data,
          start_time: new Date(),
          repositories_id: repoId
        };

        resolve(buildData);
      })
      .catch(err => reject(err));
  });
}

function generateRepositoryData(data: any): any {
  return {
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
    user_html_url: data.repository.owner.html_url,
    data: data
  };
}
