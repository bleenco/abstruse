import * as request from 'request';

import { logger, LogMessageType } from './logger';
import { getConfigAsync } from './setup';
import { getBitBucketAccessToken } from './utils';

export async function sendSuccessStatus(build: any, buildId: number): Promise<void> {
  const config = await getConfigAsync();
  if (build.repository && build.repository.access_token) {
    if (build.repository.github_id) {
      let sha = build.data.after || build.data.pull_request && build.data.pull_request.head.sha ||
        build.data.sha;
      let name = build.repository.full_name;
      let gitUrl = null;
      if (build.repository.api_url && build.repository.api_url !== '') {
        gitUrl = build.repository.api_url + `/repos/${name}/statuses/${sha}`;
      } else {
        gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
      }
      let abstruseUrl = `${config.url}/build/${buildId}`;
      return setGitHubStatusSuccess(gitUrl, abstruseUrl, build.repository.access_token);
    } else if (build.repository.bitbucket_id) {
      let sha_1 = build.data.push.changes[0].commits[0].hash;
      let name_1 = build.data.repository.full_name;
      let gitUrl_2 = `https://api.bitbucket.org/2.0/repositories`
        + `/${name_1}/commit/${sha_1}/statuses/build`;
      let abstruseUrl_1 = `${config.url}/build/${buildId}`;
      return setBitbucketStatusSuccess(gitUrl_2, abstruseUrl_1, build.repository.access_token);
    } else if (build.repository.gitlab_id) {
      let id = build.repositories_id ?
        build.repositories_id : build.data.object_attributes.target_repositories_id;
      let sha_2 = build.data.commit && build.data.commit.id || build.data.object_attributes.last_commit.id;
      let gitUrl_4 = null;
      if (build.repository.api_url && build.repository.api_url !== '') {
        gitUrl_4 = `${build.repository.api_url}/projects/${id}/statuses/${sha_2}`;
      } else {
        gitUrl_4 = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha_2}`;
      }
      let abstruseUrl_2 = `${config.url}/build/${buildId}`;
      return setGitLabStatusSuccess(gitUrl_4, abstruseUrl_2, build.repository.access_token);
    } else {
      return Promise.resolve();
    }
  } else {
    let name_2 = build.repository && build.repository.full_name ||
      build.data.repository.full_name;
    let msg: LogMessageType = {
      message: `[error]: repository: ${name_2} => access token is not set`,
      type: 'error',
      notify: true
    };
    logger.next(msg);
  }
}

export async function sendPendingStatus(buildData: any, buildId: number): Promise<void> {
  const config = await getConfigAsync();
  if (buildData.repository && buildData.repository.access_token) {
    if (buildData.repository.github_id) {
      let sha = buildData.data.after || buildData.data.pull_request &&
        buildData.data.pull_request.head.sha || buildData.data.sha;
      let name = buildData.repository.full_name;
      let gitUrl = null;
      if (buildData.repository.api_url && buildData.repository.api_url !== '') {
        gitUrl = buildData.repository.api_url + `/repos/${name}/statuses/${sha}`;
      } else {
        gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
      }
      let abstruseUrl = `${config.url}/build/${buildId}`;
      return setGitHubStatusPending(gitUrl, abstruseUrl, buildData.repository.access_token);
    } else if (buildData.repository.bitbucket_id) {
      let sha_1 = buildData.data.push.changes[0].commits[0].hash;
      let name_1 = buildData.data.repository.full_name;
      let gitUrl_2 = `https://api.bitbucket.org/2.0/repositories`
        + `/${name_1}/commit/${sha_1}/statuses/build`;
      let abstruseUrl_1 = `${config.url}/build/${buildId}`;
      return setBitbucketStatusPending(gitUrl_2, abstruseUrl_1, buildData.repository.access_token);
    } else if (buildData.repository.gitlab_id) {
      let id = buildData.repositories_id ?
        buildData.repositories_id : buildData.data.object_attributes.target_repositories_id;
      let sha_2 = buildData.data.commit && buildData.data.commit.id || buildData.data.object_attributes.last_commit.id;
      let gitUrl_4 = null;
      if (buildData.repository.api_url && buildData.repository.api_url !== '') {
        gitUrl_4 = `${buildData.repository.api_url}/projects/${id}/statuses/${sha_2}`;
      } else {
        gitUrl_4 = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha_2}`;
      }
      let abstruseUrl_2 = `${config.url}/build/${buildId}`;
      return setGitLabStatusPending(gitUrl_4, abstruseUrl_2, buildData.repository.access_token);
    } else {
      return Promise.resolve();
    }
  } else {
    let name_2 = buildData.repository && (buildData.repository.full_name ||
      buildData.data.repository.full_name);
    let msg: LogMessageType = {
      message: `[error]: repository: ${name_2} => access token is not set`,
      type: 'error',
      notify: true
    };
    logger.next(msg);
  }
}

export async function sendFailureStatus(buildData: any, buildId: number): Promise<void> {
  const config = await getConfigAsync();
  if (buildData.repository && buildData.repository.access_token) {
    if (buildData.repository.github_id) {
      let sha = buildData.data.after || buildData.data.pull_request &&
        buildData.data.pull_request.head.sha || buildData.data.sha;
      let name = buildData.repository.full_name;
      let gitUrl = null;
      if (buildData.repository.api_url && buildData.repository.api_url !== '') {
        gitUrl = buildData.repository.api_url + `/repos/${name}/statuses/${sha}`;
      } else {
        gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
      }
      let abstruseUrl = `${config.url}/build/${buildId}`;
      return setGitHubStatusFailure(gitUrl, abstruseUrl, buildData.repository.access_token);
    } else if (buildData.repository.bitbucket_id) {
      let sha_1 = buildData.data.push.changes[0].commits[0].hash;
      let name_1 = buildData.data.repository.full_name;
      let gitUrl_2 = `https://api.bitbucket.org/2.0/repositories`
        + `/${name_1}/commit/${sha_1}/statuses/build`;
      let abstruseUrl_1 = `${config.url}/build/${buildId}`;
      return setBitbucketStatusFailure(gitUrl_2, abstruseUrl_1, buildData.repository.access_token);
    } else if (buildData.repository.gitlab_id) {
      let id = buildData.repositories_id ?
        buildData.repositories_id : buildData.data.object_attributes.target_repositories_id;
      let sha_2 = buildData.data.commit && buildData.data.commit.id || buildData.data.object_attributes.last_commit.id;
      let gitUrl_4 = null;
      if (buildData.repository.api_url && buildData.repository.api_url !== '') {
        gitUrl_4 = `${buildData.repository.api_url}/projects/${id}/statuses/${sha_2}`;
      } else {
        gitUrl_4 = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha_2}`;
      }
      let abstruseUrl_2 = `${config.url}/build/${buildId}`;
      return setGitLabStatusFailure(gitUrl_4, abstruseUrl_2, buildData.repository.access_token);
    } else {
      return Promise.resolve();
    }
  } else {
    let name_2 = buildData.repository && buildData.repository.full_name ||
      buildData.data.repository.full_name;
    let msg: LogMessageType = {
      message: `[error]: repository: ${name_2} => access token is not set`,
      type: 'error',
      notify: true
    };
    logger.next(msg);
  }
}

function setGitHubStatusSuccess(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  let data = {
    'state': 'success',
    'target_url': abstruseUrl,
    'description': 'The Abstruse CI build succeeded',
    'context': 'continuous-integration/abstruse'
  };

  let header = {
    'Authorization': `token ${token}`,
    'User-Agent': 'Abstruse'
  };

  return sendRequest(gitUrl, data, header);
}

function setGitHubStatusPending(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  let data = {
    'state': 'pending',
    'target_url': abstruseUrl,
    'description': 'The Abstruse CI build is running',
    'context': 'continuous-integration/abstruse'
  };

  let header = {
    'Authorization': `token ${token}`,
    'User-Agent': 'Abstruse'
  };

  return sendRequest(gitUrl, data, header);
}


function setGitHubStatusFailure(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  let data = {
    'state': 'failure',
    'target_url': abstruseUrl,
    'description': 'The Abstruse CI build failed',
    'context': 'continuous-integration/abstruse'
  };

  let header = {
    'Authorization': `token ${token}`,
    'User-Agent': 'Abstruse'
  };

  return sendRequest(gitUrl, data, header);
}

function setGitLabStatusSuccess(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  let data = {
    'state': 'success',
    'target_url': abstruseUrl,
    'description': 'The Abstruse CI build succeeded',
    'context': 'continuous-integration/abstruse'
  };

  let header = {
    'PRIVATE-TOKEN': token
  };

  return sendRequest(gitUrl, data, header);
}

function setGitLabStatusPending(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  let data = {
    'state': 'pending',
    'target_url': abstruseUrl,
    'description': 'The Abstruse CI build is running',
    'context': 'continuous-integration/abstruse'
  };

  let header = {
    'PRIVATE-TOKEN': token
  };

  return sendRequest(gitUrl, data, header);
}


function setGitLabStatusFailure(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  let data = {
    'state': 'failure',
    'target_url': abstruseUrl,
    'description': 'The Abstruse CI build failed',
    'context': 'continuous-integration/abstruse'
  };

  let header = {
    'PRIVATE-TOKEN': token
  };

  return sendRequest(gitUrl, data, header);
}

async function setBitbucketStatusSuccess(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  try {
    const response = await getBitBucketAccessToken(token);
    let access_token = response.access_token;
    let statusData = {
      'state': 'SUCCESSFUL',
      'url': abstruseUrl,
      'description': 'The Abstruse CI build succeeded',
      'name': 'continuous-integration/abstruse',
      'key': 'continuous-integration/abstruse'
    };
    let header = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    };
    return sendRequest(gitUrl, statusData, header);
  } catch (err) {
    return Promise.reject(err);
  }
}

async function setBitbucketStatusPending(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  try {
    const response = await getBitBucketAccessToken(token);
    let access_token = response.access_token;
    let statusData = {
      'state': 'INPROGRESS',
      'url': abstruseUrl,
      'description': 'The Abstruse CI build is running',
      'name': 'continuous-integration/abstruse',
      'key': 'continuous-integration/abstruse'
    };
    let header = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    };
    return sendRequest(gitUrl, statusData, header);
  } catch (err) {
    return Promise.reject(err);
  }
}

async function setBitbucketStatusFailure(
  gitUrl: string, abstruseUrl: string, token: string
): Promise<any> {
  try {
    const response = await getBitBucketAccessToken(token);
    let access_token = response.access_token;
    let statusData = {
      'state': 'FAILED',
      'url': abstruseUrl,
      'description': 'The Abstruse CI build failed',
      'name': 'continuous-integration/abstruse',
      'key': 'continuous-integration/abstruse'
    };
    let header = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    };
    return sendRequest(gitUrl, statusData, header);
  } catch (err) {
    return Promise.reject(err);
  }
}

function sendRequest(url: string, data: any, headers: any): Promise<any> {
  return new Promise((resolve) => {
    let options = {
      url: url,
      method: 'POST',
      headers: headers,
      json: data
    };

    request(options, (err, response, body) => {
      if (err) {
        let msg: LogMessageType = {
          message: `[http]: request to ${url} failed with code ${err}`,
          type: 'error',
          notify: false
        };
        logger.next(msg);

        resolve(err);
      } else {
        if (response.statusCode < 300 && response.statusCode >= 200) {
          let msg: LogMessageType = {
            message: `[http]: request to ${url} successful`,
            type: 'info',
            notify: false
          };
          logger.next(msg);

          resolve(body);
        } else {
          let msg: LogMessageType = {
            message: `[http]: request to ${url} failed with error code ${response.statusCode}`,
            type: 'error',
            notify: false
          };
          logger.next(msg);

          resolve({
            statusCode: response.statusCode,
            response: body
          });
        }
      }
    });
  });
}
