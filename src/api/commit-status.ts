import { sendRequest, getBitBucketAccessToken, getConfig } from './utils';
import * as logger from './logger';
import { yellow, red, blue, bold } from 'chalk';

export function sendSuccessStatus(build: any, buildId: number): Promise<void> {
  const config: any = getConfig();
  if (build.repository && build.repository.access_token) {
    if (build.repository.github_id) {
      const sha = build.data.after || build.data.pull_request.head.sha;
      const name = build.data.repository.full_name;
      const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setGitHubStatusSuccess(gitUrl, abstruseUrl,
        build.repository.access_token);
    } else if (build.repository.bitbucket_id) {
      const sha = build.data.sha;
      const name = build.data.repository.full_name;
      const gitUrl = `https://api.bitbucket.org/2.0/repositories`
        + `/${name}/commit/${sha}/statuses/build`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setBitbucketStatusSuccess(gitUrl, abstruseUrl,
        build.repository.access_token);
    } else if (build.repository.gitlab_id) {
      const id = build.data.project_id ?
        build.data.project_id : build.data.object_attributes.target_project_id;
      const sha = build.data.checkout_sha || build.data.object_attributes.last_commit.id;
      const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setGitLabStatusSuccess(gitUrl, abstruseUrl,
        build.repository.access_token);
    } else {
      return Promise.resolve();
    }
  } else {
    let msg = [
      yellow('['),
      red('error'),
      yellow(']'),
      ' --- ',
      `access_token is not set for repository ${bold(build.repository.full_name)}!`
    ].join('');
    logger.error(msg);
    return Promise.resolve();
  }
}

export function sendPendingStatus(buildData: any, buildId: number): Promise<void> {
  const config: any = getConfig();
  if (buildData.repository && buildData.repository.access_token) {
    if (buildData.repository.github_id) {
      const sha = buildData.data.after || buildData.data.pull_request.head.sha;
      const name = buildData.data.repository.full_name;
      const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setGitHubStatusPending(gitUrl, abstruseUrl, buildData.repository.access_token);
    } else if (buildData.repository.bitbucket_id) {
      const sha = buildData.data.sha;
      const name = buildData.data.repository.full_name;
      const gitUrl = `https://api.bitbucket.org/2.0/repositories`
        + `/${name}/commit/${sha}/statuses/build`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setBitbucketStatusPending(gitUrl, abstruseUrl, buildData.repository.access_token);
    } else if (buildData.repository.gitlab_id) {
      const id = buildData.data.project_id ?
      buildData.data.project_id : buildData.data.object_attributes.target_project_id;
      const sha = buildData.data.checkout_sha || buildData.data.object_attributes.last_commit.id;
      const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setGitLabStatusPending(gitUrl, abstruseUrl, buildData.repository.access_token);
    } else {
      return Promise.resolve();
    }
  } else {
    let msg = [
      yellow('['),
      red('error'),
      yellow(']'),
      ' --- ',
      `access_token is not set for repository ${bold(buildData.repository.full_name)}!`
    ].join('');
    logger.error(msg);
    return Promise.resolve();
  }
}

export function sendFailureStatus(buildData: any, buildId: number): Promise<void> {
  const config: any = getConfig();
  if (buildData.repository && buildData.repository.access_token) {
    if (buildData.repository.github_id) {
      const sha = buildData.data.after || buildData.data.pull_request.head.sha;
      const name = buildData.data.repository.full_name;
      const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setGitHubStatusFailure(gitUrl, abstruseUrl, buildData.repository.access_token);
    } else if (buildData.repository.bitbucket_id) {
      const sha = buildData.data.sha;
      const name = buildData.data.repository.full_name;
      const gitUrl = `https://api.bitbucket.org/2.0/repositories`
        + `/${name}/commit/${sha}/statuses/build`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setBitbucketStatusFailure(gitUrl, abstruseUrl, buildData.repository.access_token);
    } else if (buildData.repository.gitlab_id) {
      const id = buildData.data.project_id ?
      buildData.data.project_id : buildData.data.object_attributes.target_project_id;
      const sha = buildData.data.checkout_sha || buildData.data.object_attributes.last_commit.id;
      const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
      const abstruseUrl = `${config.url}/build/${buildId}`;

      return setGitLabStatusFailure(gitUrl, abstruseUrl, buildData.repository.access_token);
    } else {
      return Promise.resolve();
    }
  } else {
    let msg = [
      yellow('['),
      red('error'),
      yellow(']'),
      ' --- ',
      `access_token is not set for repository ${bold(buildData.repository.full_name)}!`
    ].join('');
    logger.error(msg);
    return Promise.resolve();
  }
}

function setGitHubStatusSuccess(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
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
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
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

function setGitHubStatusError(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
  let data = {
    'state': 'error',
    'target_url': abstruseUrl,
    'description': 'The Abstruse CI build errored',
    'context': 'continuous-integration/abstruse'
  };

  let header = {
    'Authorization': `token ${token}`,
    'User-Agent': 'Abstruse'
  };

  return sendRequest(gitUrl, data, header);
}

function setGitHubStatusFailure(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
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
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
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
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
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

function setGitLabStatusError(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
  let data = {
    'state': 'error',
    'target_url': abstruseUrl,
    'description': 'The Abstruse CI build errored',
    'context': 'continuous-integration/abstruse'
  };

  let header = {
    'PRIVATE-TOKEN': token
  };

  return sendRequest(gitUrl, data, header);
}

function setGitLabStatusFailure(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
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

function setBitbucketStatusSuccess(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
  return getBitBucketAccessToken(token)
    .then(response => {
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
    })
    .catch(err => Promise.reject(err));
}

function setBitbucketStatusPending(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
    return getBitBucketAccessToken(token)
    .then(response => {
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
    })
    .catch(err => Promise.reject(err));
}

function setBitbucketStatusFailure(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
    return getBitBucketAccessToken(token)
    .then(response => {
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
    })
    .catch(err => Promise.reject(err));
}
