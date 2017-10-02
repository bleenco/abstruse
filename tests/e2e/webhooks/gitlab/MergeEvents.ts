export let request = {
  'object_kind': 'merge_request',
  'user': {
    'name': 'Izak Lipnik',
    'username': 'izak88',
    'avatar_url':
      'https://secure.gravatar.com/avatar/c27a4cf56134b3956555fc8e1d7cced0?s=80&d=identicon'
  },
  'project': {
    'name': 'd3-bundle',
    'description': '',
    'web_url': 'https://gitlab.com/izak88/d3-bundle',
    'avatar_url': null,
    'git_ssh_url': 'git@gitlab.com:izak88/d3-bundle.git',
    'git_http_url': 'https://gitlab.com/izak88/d3-bundle.git',
    'namespace': 'izak88',
    'visibility_level': 20,
    'path_with_namespace': 'izak88/d3-bundle',
    'default_branch': 'master',
    'ci_config_path': null,
    'homepage': 'https://gitlab.com/izak88/d3-bundle',
    'url': 'git@gitlab.com:izak88/d3-bundle.git',
    'ssh_url': 'git@gitlab.com:izak88/d3-bundle.git',
    'http_url': 'https://gitlab.com/izak88/d3-bundle.git'
  },
  'object_attributes': {
    'id': 5244277,
    'target_branch': 'master',
    'source_branch': 'test',
    'source_project_id': 4283451,
    'author_id': 1505971,
    'assignee_id': null,
    'title': 'test branch',
    'created_at': '2017-10-02 06:39:59 UTC',
    'updated_at': '2017-10-02 06:39:59 UTC',
    'milestone_id': null,
    'state': 'opened',
    'merge_status': 'unchecked',
    'target_project_id': 4283451,
    'iid': 1,
    'description': '',
    'updated_by_id': null,
    'merge_error': null,
    'merge_params': {
      'force_remove_source_branch': '0'
    },
    'merge_when_pipeline_succeeds': false,
    'merge_user_id': null,
    'merge_commit_sha': null,
    'deleted_at': null,
    'approvals_before_merge': null,
    'rebase_commit_sha': null,
    'in_progress_merge_commit_sha': null,
    'lock_version': null,
    'time_estimate': 0,
    'squash': false,
    'last_edited_at': null,
    'last_edited_by_id': null,
    'head_pipeline_id': null,
    'ref_fetched': true,
    'merge_jid': null,
    'source': {
      'name': 'd3-bundle',
      'description': '',
      'web_url': 'https://gitlab.com/izak88/d3-bundle',
      'avatar_url': null,
      'git_ssh_url': 'git@gitlab.com:izak88/d3-bundle.git',
      'git_http_url': 'https://gitlab.com/izak88/d3-bundle.git',
      'namespace': 'izak88',
      'visibility_level': 20,
      'path_with_namespace': 'izak88/d3-bundle',
      'default_branch': 'master',
      'ci_config_path': null,
      'homepage': 'https://gitlab.com/izak88/d3-bundle',
      'url': 'git@gitlab.com:izak88/d3-bundle.git',
      'ssh_url': 'git@gitlab.com:izak88/d3-bundle.git',
      'http_url': 'https://gitlab.com/izak88/d3-bundle.git'
    },
    'target': {
      'name': 'd3-bundle',
      'description': '',
      'web_url': 'https://gitlab.com/izak88/d3-bundle',
      'avatar_url': null,
      'git_ssh_url': 'git@gitlab.com:izak88/d3-bundle.git',
      'git_http_url': 'https://gitlab.com/izak88/d3-bundle.git',
      'namespace': 'izak88',
      'visibility_level': 20,
      'path_with_namespace': 'izak88/d3-bundle',
      'default_branch': 'master',
      'ci_config_path': null,
      'homepage': 'https://gitlab.com/izak88/d3-bundle',
      'url': 'git@gitlab.com:izak88/d3-bundle.git',
      'ssh_url': 'git@gitlab.com:izak88/d3-bundle.git',
      'http_url': 'https://gitlab.com/izak88/d3-bundle.git'
    },
    'last_commit': {
      'id': '9ca1197fe5a5c0f2567fb0c9fdb0d5f8c9c919d9',
      'message': 'test branch\n',
      'timestamp': '2017-10-02T08:39:29+02:00',
      'url': 'https://gitlab.com/izak88/d3-bundle/commit/9ca1197fe5a5c0f2567fb0c9fdb0d5f8c9c919d9',
      'author': {
        'name': 'Izak Lipnik',
        'email': 'izak.lipnik@gmail.com'
      }
    },
    'work_in_progress': false,
    'total_time_spent': 0,
    'human_total_time_spent': null,
    'human_time_estimate': null,
    'url': 'https://gitlab.com/izak88/d3-bundle/merge_requests/1',
    'action': 'open'
  },
  'labels': [

  ],
  'repository': {
    'name': 'd3-bundle',
    'url': 'git@gitlab.com:izak88/d3-bundle.git',
    'description': '',
    'homepage': 'https://gitlab.com/izak88/d3-bundle'
  }
};

export let header = {
  'Content-Type': 'application/json',
  'X-Gitlab-Event': 'Merge Request Hook',
  'X-Gitlab-Token': 'thisIsSecret'
};
