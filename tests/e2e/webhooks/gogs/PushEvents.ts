export let request = {
  'ref': 'refs/heads/master',
  'before': '0000000000000000000000000000000000000000',
  'after': '59c4f9658579f65f64f2a5df4c7d7b72474c7882',
  'compare_url': '',
  'commits': [
    {
      'id': '59c4f9658579f65f64f2a5df4c7d7b72474c7882',
      'message': 'first commit\n',
      'url': 'https://try.gogs.io/izak88/test/commit/59c4f9658579f65f64f2a5df4c7d7b72474c7882',
      'author': {
        'name': 'Izak Lipnik',
        'email': 'izak.lipnik@gmail.com',
        'username': 'izak88'
      },
      'committer': {
        'name': 'Izak Lipnik',
        'email': 'izak.lipnik@gmail.com',
        'username': 'izak88'
      },
      'added': [
        'README.md'
      ],
      'removed': [],
      'modified': [],
      'timestamp': '2017-08-02T07:48:52Z'
    }
  ],
  'repository': {
    'id': 10335,
    'owner': {
      'id': 15888,
      'login': 'izak88',
      'full_name': '',
      'email': 'izak.lipnik@gmail.com',
      'avatar_url': 'https://secure.gravatar.com/avatar/c27a4cf56134b3956555fc8e1d7cced0',
      'username': 'izak88'
    },
    'name': 'test',
    'full_name': 'izak88/test',
    'description': 'test',
    'private': false,
    'fork': false,
    'parent': null,
    'empty': false,
    'mirror': false,
    'size': 12288,
    'html_url': 'https://try.gogs.io/izak88/test',
    'ssh_url': 'git@try.gogs.io:izak88/test.git',
    'clone_url': 'https://try.gogs.io/izak88/test.git',
    'website': '',
    'stars_count': 0,
    'forks_count': 0,
    'watchers_count': 1,
    'open_issues_count': 1,
    'default_branch': 'master',
    'created_at': '2017-08-02T07:14:53Z',
    'updated_at': '2017-08-02T07:14:53Z'
  },
  'pusher': {
    'id': 15888,
    'login': 'izak88',
    'full_name': '',
    'email': 'izak.lipnik@gmail.com',
    'avatar_url': 'https://secure.gravatar.com/avatar/c27a4cf56134b3956555fc8e1d7cced0',
    'username': 'izak88'
  },
  'sender': {
    'id': 15888,
    'login': 'izak88',
    'full_name': '',
    'email': 'izak.lipnik@gmail.com',
    'avatar_url': 'https://secure.gravatar.com/avatar/c27a4cf56134b3956555fc8e1d7cced0',
    'username': 'izak88'
  }
};

export let header = {
  'Content-Type': 'application/json',
  'X-Gogs-Delivery': 'c5c8ee50-20fc-4545-a4f4-b272f8a3afc0',
  'X-Gogs-Event': 'push',
  'X-Gogs-Signature': '6bd4b34f02c78656ed58e1b7d16155357d5f389f37b7346de4f52acc6fb54b70'
};
