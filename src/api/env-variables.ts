export interface EnvVariables {
  [key: string]: string | number | boolean;
}

export function set(envs: EnvVariables, key: string, value: string | number | boolean): void {
  envs[key] = value;
}

export function unset(envs: EnvVariables, key: string): void {
  envs[key] = null;
}

export function serialize(envs: EnvVariables): string[] {
  return Object.keys(envs).map(key => `${key}=${envs[key]}`);
}

export function unserialize(envs: string[]): EnvVariables {
  return envs.reduce((acc, curr) => {
    const splitted = curr.split('=');
    acc = Object.assign({}, acc, { [splitted[0]]: splitted[1] });
    return acc;
  }, {});
}

export function generate(data: any): EnvVariables {
  const envs = init();
  const request = data.requestData;
  const commit = request.data.pull_request && request.data.pull_request.head
                 && request.data.pull_request.head.sha ||
                 request.data.head_commit && request.data.head_commit.id ||
                 request.data.sha ||
                 request.data.object_attributes && request.data.object_attributes.last_commit &&
                 request.data.object_attributes.last_commit.id ||
                 request.data.push && request.data.push.changes[0].commits[0].hash ||
                 request.data.pullrequest && request.data.pullrequest.source &&
                 request.data.pullrequest.source.commit &&
                 request.data.pullrequest.source.commit.hash ||
                 request.data.commit || '';
  const tag = request.ref && request.ref.startsWith('refs/tags/') ?
    request.ref.replace('refs/tags/', '') : null;

  set(envs, 'ABSTRUSE_BRANCH', request.branch);
  set(envs, 'ABSTRUSE_BUILD_ID', data.build_id);
  set(envs, 'ABSTRUSE_JOB_ID', data.job_id);
  set(envs, 'ABSTRUSE_COMMIT', commit);
  set(envs, 'ABSTRUSE_EVENT_TYPE', request.pr ? 'pull_request' : 'push');
  set(envs, 'ABSTRUSE_PULL_REQUEST', request.pr ? request.pr : false);
  set(envs, 'ABSTRUSE_PULL_REQUEST_BRANCH', request.pr ? request.branch : '');
  set(envs, 'ABSTRUSE_TAG', tag);

  const prSha = request.pr ? commit : '';
  set(envs, 'ABSTRUSE_PULL_REQUEST_SHA', prSha);

  return envs;
}

function init(): EnvVariables {
  return [
    'ABSTRUSE_BRANCH', 'ABSTRUSE_BUILD_DIR', 'ABSTRUSE_BUILD_ID',
    'ABSTRUSE_JOB_ID', 'ABSTRUSE_COMMIT', 'ABSTRUSE_EVENT_TYPE',
    'ABSTRUSE_PULL_REQUEST', 'ABSTRUSE_PULL_REQUEST_BRANCH',
    'ABSTRUSE_TAG', 'ABSTRUSE_PULL_REQEUST_SHA', 'ABSTRUSE_SECURE_ENV_VARS',
    'ABSTRUSE_TEST_RESULT'
  ].reduce((acc, curr) => {
    acc = Object.assign(acc, { [curr]: null });
    return acc;
  }, {});
}
