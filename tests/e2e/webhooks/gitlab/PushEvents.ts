export let request = {
  'object_kind': 'push',
  'event_name': 'push',
  'before': 'd7ba533cd1abc29f0eccbff3b5a731fa3e6824cd',
  'after': 'd7ba533cd1abc29f0eccbff3b5a731fa3e6824cd',
  'ref': 'refs/heads/master',
  'checkout_sha': 'd7ba533cd1abc29f0eccbff3b5a731fa3e6824cd',
  'message': null,
  'user_id': 1505971,
  'user_name': 'Izak Lipnik',
  'user_username': 'izak88',
  'user_email': 'izak.lipnik@gmail.com',
  'user_avatar':
    'https://secure.gravatar.com/avatar/c27a4cf56134b3956555fc8e1d7cced0?s=80&d=identicon',
  'project_id': 3827788,
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
  'commits': [
    {
      'id': 'd7ba533cd1abc29f0eccbff3b5a731fa3e6824cd',
      'message': 'Add readme.md',
      'timestamp': '2017-08-01T12:45:41+00:00',
      'url': 'https://gitlab.com/izak88/test/commit/d7ba533cd1abc29f0eccbff3b5a731fa3e6824cd',
      'author': {
        'name': 'Izak Lipnik',
        'email': 'izak.lipnik@gmail.com'
      },
      'added': [
        'README.md'
      ],
      'modified': [

      ],
      'removed': [

      ]
    }
  ],
  'total_commits_count': 1,
  'repository': {
    'name': 'test',
    'url': 'git@gitlab.com:izak88/test.git',
    'description': 'test',
    'homepage': 'https://gitlab.com/izak88/test',
    'git_http_url': 'https://gitlab.com/izak88/test.git',
    'git_ssh_url': 'git@gitlab.com:izak88/test.git',
    'visibility_level': 20
  }
};

export let header = {
  'Content-Type': 'application/json',
  'X-Gitlab-Event': 'Push Hook',
  'X-Gitlab-Token': 'thisIsSecret'
};
