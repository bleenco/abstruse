import * as request from 'request';

function sendRequest(url: string, data: any, headers: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let options = {
      url: url,
      method: 'POST',
      headers: headers,
      json: data
    };

    request(options, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        if (response.statusCode < 300 && response.statusCode >= 200) {
          resolve(body);
        } else {
          reject({
            statusCode: response.statusCode,
            response: body
          });
        }
      }
    });
  });
}

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
      'description': 'The Abstruse CI build succeeded',
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
      'description': 'The Abstruse CI build succeeded',
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
      'description': 'The Abstruse CI build succeeded',
      'context': 'continuous-integration/abstruse'
    };

    let header = {
      'Authorization': `token ${token}`,
      'User-Agent': 'Abstruse'
    };

    return sendRequest(gitUrl, data, header);
}
