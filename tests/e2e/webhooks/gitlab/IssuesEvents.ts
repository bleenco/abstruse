export let request = {
  'object_kind': 'issue',
  'user': {
    'name': 'Administrator',
    'username': 'root',
    'avatar_url':
      'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=40\u0026d=identicon'
  },
  'project': {
    'name': 'Gitlab Test',
    'description': 'Aut reprehenderit ut est.',
    'web_url': 'http://example.com/gitlabhq/gitlab-test',
    'avatar_url': null,
    'git_ssh_url': 'git@example.com:gitlabhq/gitlab-test.git',
    'git_http_url': 'http://example.com/gitlabhq/gitlab-test.git',
    'namespace': 'GitlabHQ',
    'visibility_level': 20,
    'path_with_namespace': 'gitlabhq/gitlab-test',
    'default_branch': 'master',
    'homepage': 'http://example.com/gitlabhq/gitlab-test',
    'url': 'http://example.com/gitlabhq/gitlab-test.git',
    'ssh_url': 'git@example.com:gitlabhq/gitlab-test.git',
    'http_url': 'http://example.com/gitlabhq/gitlab-test.git'
  },
  'repository': {
    'name': 'Gitlab Test',
    'url': 'http://example.com/gitlabhq/gitlab-test.git',
    'description': 'Aut reprehenderit ut est.',
    'homepage': 'http://example.com/gitlabhq/gitlab-test'
  },
  'object_attributes': {
    'id': 301,
    'title': 'New API: create/update/delete file',
    'assignee_ids': [51],
    'assignee_id': 51,
    'author_id': 51,
    'project_id': 14,
    'created_at': '2013-12-03T17:15:43Z',
    'updated_at': '2013-12-03T17:15:43Z',
    'position': 0,
    'branch_name': null,
    'description': 'Create new API for manipulations with repository',
    'milestone_id': null,
    'state': 'opened',
    'iid': 23,
    'url': 'http://example.com/diaspora/issues/23',
    'action': 'open'
  },
  'assignees': [{
    'name': 'User1',
    'username': 'user1',
    'avatar_url':
      'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=40\u0026d=identicon'
  }],
  'assignee': {
    'name': 'User1',
    'username': 'user1',
    'avatar_url':
     'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=40\u0026d=identicon'
  },
  'labels': [{
    'id': 206,
    'title': 'API',
    'color': '#ffffff',
    'project_id': 14,
    'created_at': '2013-12-03T17:15:43Z',
    'updated_at': '2013-12-03T17:15:43Z',
    'template': false,
    'description': 'API related issues',
    'type': 'ProjectLabel',
    'group_id': 41
  }]
};

export let header = {
  'Content-Type': 'application/json',
  'X-Gitlab-Event': 'Issue Hook',
  'X-Gitlab-Token': 'thisIsSecret'
};
