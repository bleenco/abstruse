import { Repository, Build } from './model';
import { getHttpJsonResponse } from '../utils';
import { addRepositoryPermissionToEveryone } from './permission';

export function getRepository(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository({ id: id }).fetch({ withRelated: ['access_token'] })
      .then(repo => !repo ? reject(repo) : resolve(repo.toJSON()))
      .catch(err => reject(err));
  });
}

export function getRepositoryBuilds(id: number, limit: number, offset: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Build().query(qb => {
      qb.where('repositories_id', id);
      qb.orderBy('id', 'desc');
      qb.limit(limit);
      qb.offset(offset);
    })
    .fetchAll({ withRelated: ['jobs.runs'] })
    .then(builds => {
      if (!builds) {
        reject();
      }

      builds = builds.toJSON();
      builds = builds.map(build => {
        build.jobs = build.jobs.map(job => {
          if (job.runs.length > 0) {
            job.end_time = job.runs[job.runs.length - 1].end_time;
            job.start_time = job.runs[job.runs.length - 1].start_time;
            job.status = job.runs[job.runs.length - 1].status;
          }

          return job;
        });

        return build;
      });

      resolve(builds);
    }).catch(err => reject(err));
  });
}

export function getRepositoryOnly(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository({ id: id }).fetch({ withRelated: ['access_token'] }).then(repo => {
      if (!repo) {
        reject(repo);
      } else {
        repo = repo.toJSON();

        repo.access_token = repo.access_token && repo.access_token.token ?
          repo.access_token.token : null;

        resolve(repo);
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
          let status = 'unknown';

          if (repo.builds[0] && repo.builds[0].runs[0]) {
            if (repo.builds[0].runs[0].job_runs.findIndex(run => run.status === 'queued') !== -1) {
              status = 'queued';
            }

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

export function getRepositories(keyword: string, userId?: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    new Repository().query(qb => {
      if (keyword !== '') {
        qb.where('full_name', 'like', `%${keyword}%`).orWhere('clone_url', 'like', `%${keyword}%`);
      }
    }).fetchAll({ withRelated: [{'permissions': (query) => {
      query.where('users_id', userId).andWhere('permission', true); }}] })
    .then(repos => {
      if (!repos) {
        reject();
      }
      repos = repos.toJSON();
      repos = repos.filter(r => {
        return !r.private || (r.permissions && r.permissions.length > 0);
      });

      resolve(repos);
    });
  });
}

export function getRepositoryId(owner: string, repository: string): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository().query(q => q.where('full_name', `${owner}/${repository}`)).fetch()
      .then(repo => !repo ? reject() : resolve(repo.toJSON().id));
  });
}

export function addRepository(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository().save(data, { method: 'insert' })
      .then(result => {
        if (!result) {
          reject(result);
        } else {
          let repository = result.toJSON();
          return addRepositoryPermissionToEveryone(result.id)
            .then(() => resolve(repository))
            .catch(err => reject(err));
        }
      })
      .catch(err => reject(err));
  });
}

export function saveRepositorySettings(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    new Repository({ id: data.id }).save(data, { method: 'update', require: false })
      .then(repo => !repo ? reject(repo) : resolve(repo.toJSON()));
  });
}

export function updateRepository(data: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let repository: Repository;
    if (data.github_id) {
      repository = new Repository().where({ github_id: data.github_id });
    } else if (data.bitbucket_id) {
      repository = new Repository().where({ bitbucket_id: data.bitbucket_id });
    } else {
      reject('Repository Id missing');
    }

    repository.save(data, { method: 'update', require: false }).then(result => {
      if (!result) {
        reject(result);
      } else {
        resolve(result.toJSON());
      }
    }).catch(err => reject(err));
  });
}

export function pingGitHubRepository(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const saveData = generateGitHubRepositoryData(data);
    new Repository().where({ github_id: saveData.github_id }).fetch()
      .then(repo => {
        if (!repo) {
          new Repository().save(saveData, { method: 'insert' })
          .then(result => {
            if (!result) {
              reject(result);
            } else {
              let repository = result.toJSON();
              return addRepositoryPermissionToEveryone(result.id)
                .then(() => resolve(repository))
                .catch(err => reject(err));
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

export function pingBitbucketRepository(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const saveData = generateBitbucketRepositoryData(data);
    new Repository().where({ bitbucket_id: saveData.bitbucket_id }).fetch()
      .then(repo => {
        if (!repo) {
          new Repository().save(saveData, { method: 'insert' })
          .then(result => {
            if (!result) {
              reject(result);
            } else {
              let repository = result.toJSON();
              return addRepositoryPermissionToEveryone(result.id)
                .then(() => resolve(repository))
                .catch(err => reject(err));
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

export function createGitHubPullRequest(data: any): Promise<any> {
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
          const repoData = generateGitHubRepositoryData(data);
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

export function synchronizeGitHubPullRequest(data: any): Promise<any> {
  let repoId;
  return new Promise((resolve, reject) => {
    const ghid = data.base ? data.base.repo.id : data.pull_request.base.repo.id;
    new Repository().where({ github_id: ghid }).fetch()
      .then(repository => {
        if (!repository) {
          const repoData = generateGitHubRepositoryData(data);
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
        const repoData = generateGitHubRepositoryData(data);
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

export function synchronizeBitbucketPullRequest(data: any): Promise<any> {
  let repoId;
  return new Promise((resolve, reject) => {
    new Repository().where({ bitbucket_id: data.repository.uuid }).fetch()
      .then(repository => {
        if (!repository) {
          const repoData = generateBitbucketRepositoryData(data);
          return addRepository(repoData).then(repo => {
            repoId = repo.id;
          });
        } else {
          const repoJson = repository.toJSON();
          repoId = repoJson.id;
          const repoData = generateBitbucketRepositoryData(data);
          return updateRepository(repoData);
        }
      })
      .then(() => {
        const buildData = {
          pr: data.pull_request ? data.pull_request.id : null,
          data: data,
          start_time: new Date(),
          repositories_id: repoId
        };

        resolve(buildData);
      })
      .catch(err => reject(err));
  });
}

function generateGitHubRepositoryData(data: any): any {
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

function generateBitbucketRepositoryData(data: any): any {
  return {
    bitbucket_id: data.repository.uuid,
    clone_url: `${data.repository.links.html.href}.git`,
    html_url: data.repository.links.html.href,
    default_branch: data.changes && data.changes[0].new.name ? data.changes[0].new.name
      : data.pullrequest ? data.pullrequest.destination.branch.name : '',
    name: data.repository.name,
    full_name: data.repository.full_name,
    private: data.repository.is_private,
    user_login: data.actor.username,
    user_id: data.actor.uuid,
    user_avatar_url: data.actor.links.avatar.href,
    user_url: data.actor.links.self.href,
    user_html_url: data.actor.links.html.href,
    data: data
  };
}
