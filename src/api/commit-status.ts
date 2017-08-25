import { sendRequest, getBitBucketAccessToken } from './utils';

export function setGitHubStatusSuccess(
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

export function setGitHubStatusPending(
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

export function setGitHubStatusError(
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

export function setGitHubStatusFailure(
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

export function setGitLabStatusSuccess(
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

export function setGitLabStatusPending(
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

export function setGitLabStatusError(
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

export function setGitLabStatusFailure(
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

export function setBitbucketStatusSuccess(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
  return getBitBucketAccessToken(token)
    .then(response => {
      let access_token = JSON.parse(response).access_token;
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

export function setBitbucketStatusPending(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
    return getBitBucketAccessToken(token)
    .then(response => {
      let access_token = JSON.parse(response).access_token;
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

export function setBitbucketStatusFailure(
  gitUrl: string, abstruseUrl: string, token: string): Promise<any> {
    return getBitBucketAccessToken(token)
    .then(response => {
      let access_token = JSON.parse(response).access_token;
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
