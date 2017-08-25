export let request = {
  'object_kind': 'merge_request',
  'user': {
    'name': 'Izak Lipnik',
    'username': 'izak88',
    'avatar_url': 'https://secure.gravatar.com/avatar/'
                  + 'c27a4cf56134b3956555fc8e1d7cced0?s=80&d=identicon'
  },
  'project': {
    'name': 'test',
    'description': 'test',
    'web_url': 'https://gitlab.com/izak88/test',
    'avatar_url': null,
    'git_ssh_url': 'git@gitlab.com:izak88/test.git',
    'git_http_url': 'https://gitlab.com/izak88/test.git',
    'namespace': 'izak88',
    'visibility_level': 20,
    'path_with_namespace': 'izak88/test',
    'default_branch': 'master',
    'ci_config_path': null,
    'homepage': 'https://gitlab.com/izak88/test',
    'url': 'git@gitlab.com:izak88/test.git',
    'ssh_url': 'git@gitlab.com:izak88/test.git',
    'http_url': 'https://gitlab.com/izak88/test.git'
  },
  'object_attributes': {
    'id': 4770446,
    'target_branch': 'master',
    'source_branch': 'testbranch',
    'source_project_id': 3827788,
    'author_id': 1505971,
    'assignee_id': null,
    'title': 'test',
    'created_at': '2017-08-22 14:23:41 UTC',
    'updated_at': '2017-08-22 14:23:41 UTC',
    'milestone_id': null,
    'state': 'opened',
    'merge_status': 'unchecked',
    'target_project_id': 3827788,
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
      'name': 'test',
      'description': 'test',
      'web_url': 'https://gitlab.com/izak88/test',
      'avatar_url': null,
      'git_ssh_url': 'git@gitlab.com:izak88/test.git',
      'git_http_url': 'https://gitlab.com/izak88/test.git',
      'namespace': 'izak88',
      'visibility_level': 20,
      'path_with_namespace': 'izak88/test',
      'default_branch': 'master',
      'ci_config_path': null,
      'homepage': 'https://gitlab.com/izak88/test',
      'url': 'git@gitlab.com:izak88/test.git',
      'ssh_url': 'git@gitlab.com:izak88/test.git',
      'http_url': 'https://gitlab.com/izak88/test.git'
    },
    'target': {
      'name': 'test',
      'description': 'test',
      'web_url': 'https://gitlab.com/izak88/test',
      'avatar_url': null,
      'git_ssh_url': 'git@gitlab.com:izak88/test.git',
      'git_http_url': 'https://gitlab.com/izak88/test.git',
      'namespace': 'izak88',
      'visibility_level': 20,
      'path_with_namespace': 'izak88/test',
      'default_branch': 'master',
      'ci_config_path': null,
      'homepage': 'https://gitlab.com/izak88/test',
      'url': 'git@gitlab.com:izak88/test.git',
      'ssh_url': 'git@gitlab.com:izak88/test.git',
      'http_url': 'https://gitlab.com/izak88/test.git'
    },
    'last_commit': {
      'id': '56cbb9d102695e5f8a1dbd47a23e99a4b425dc30',
      'message': 'test\n',
      'timestamp': '2017-08-22T16:22:20+02:00',
      'url': 'https://gitlab.com/izak88/test/commit/56cbb9d102695e5f8a1dbd47a23e99a4b425dc30',
      'author': {
        'name': 'Izak Lipnik',
        'email': 'izak.lipnik@gmail.com'
      }
    },
    'work_in_progress': false,
    'total_time_spent': 0,
    'human_total_time_spent': null,
    'human_time_estimate': null,
    'url': 'https://gitlab.com/izak88/test/merge_requests/1',
    'action': 'open'
  },
  'labels': [

  ],
  'repository': {
    'name': 'test',
    'url': 'git@gitlab.com:izak88/test.git',
    'description': 'test',
    'homepage': 'https://gitlab.com/izak88/test'
  }
};

export let header = {
  'Content-Type': 'application/json',
  'X-Gitlab-Event': 'Merge Request Hook',
  'X-Gitlab-Token': 'thisIsSecret'
};
