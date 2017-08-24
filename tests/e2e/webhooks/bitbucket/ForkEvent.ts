export let request = {
  'fork': {
    'scm': 'git',
    'website': null,
    'has_wiki': false,
    'name': 'test_fork',
    'links': {
      'downloads': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test_fork/downloads'
      },
      'watchers': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test_fork/watchers'
      },
      'branches': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test_fork/refs/branches'
      },
      'tags': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test_fork/refs/tags'
      },
      'commits': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test_fork/commits'
      },
      'clone': [
        {
          'href': 'https://bitbucket.org/Izak88/test_fork.git',
          'name': 'https'
        },
        {
          'href': 'ssh://git@bitbucket.org/Izak88/test_fork.git',
          'name': 'ssh'
        }
      ],
      'html': {
        'href': 'https://bitbucket.org/Izak88/test_fork'
      },
      'avatar': {
        'href': 'https://bitbucket.org/Izak88/test_fork/avatar/32/'
      },
      'forks': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test_fork/forks'
      },
      'self': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test_fork'
      },
      'pullrequests': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test_fork/pullrequests'
      }
    },
    'fork_policy': 'allow_forks',
    'description': '',
    'language': '',
    'created_on': '2017-08-01T10:59:26.173088+00:00',
    'parent': {
      'full_name': 'Izak88/test',
      'type': 'repository',
      'name': 'test',
      'links': {
        'self': {
          'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test'
        },
        'html': {
          'href': 'https://bitbucket.org/Izak88/test'
        },
        'avatar': {
          'href': 'https://bitbucket.org/Izak88/test/avatar/32/'
        }
      },
      'uuid': '{555997f5-1f4c-4afa-9c63-71e3ee5d725b}'
    },
    'mainbranch': {},
    'full_name': 'Izak88/test_fork',
    'updated_on': '2017-08-01T10:59:26.274630+00:00',
    'owner': {
      'username': 'Izak88',
      'type': 'user',
      'display_name': 'Izak',
      'uuid': '{89aa91f6-b254-4f9f-9fd6-ab5fdf729bca}',
      'links': {
        'self': {
          'href': 'https://api.bitbucket.org/2.0/users/Izak88'
        },
        'html': {
          'href': 'https://bitbucket.org/Izak88/'
        },
        'avatar': {
          'href': 'https://bitbucket.org/account/Izak88/avatar/32/'
        }
      }
    },
    'has_issues': true,
    'size': 0,
    'type': 'repository',
    'slug': 'test_fork',
    'is_private': false,
    'uuid': '{0c8ee7cd-0d82-4e91-b5f4-4358541958b9}'
  },
  'actor': {
    'username': 'Izak88',
    'type': 'user',
    'display_name': 'Izak',
    'uuid': '{89aa91f6-b254-4f9f-9fd6-ab5fdf729bca}',
    'links': {
      'self': {
        'href': 'https://api.bitbucket.org/2.0/users/Izak88'
      },
      'html': {
        'href': 'https://bitbucket.org/Izak88/'
      },
      'avatar': {
        'href': 'https://bitbucket.org/account/Izak88/avatar/32/'
      }
    }
  },
  'repository': {
    'scm': 'git',
    'website': '',
    'name': 'test',
    'links': {
      'self': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test'
      },
      'html': {
        'href': 'https://bitbucket.org/Izak88/test'
      },
      'avatar': {
        'href': 'https://bitbucket.org/Izak88/test/avatar/32/'
      }
    },
    'full_name': 'Izak88/test',
    'owner': {
      'username': 'Izak88',
      'type': 'user',
      'display_name': 'Izak',
      'uuid': '{89aa91f6-b254-4f9f-9fd6-ab5fdf729bca}',
      'links': {
        'self': {
          'href': 'https://api.bitbucket.org/2.0/users/Izak88'
        },
        'html': {
          'href': 'https://bitbucket.org/Izak88/'
        },
        'avatar': {
          'href': 'https://bitbucket.org/account/Izak88/avatar/32/'
        }
      }
    },
    'type': 'repository',
    'is_private': false,
    'uuid': '{555997f5-1f4c-4afa-9c63-71e3ee5d725b}'
  }
};

export let header = {
  'X-Request-UUID':	'69c56047-577b-46f9-a1dd-9c4e27273bc1',
  'X-Event-Key':	'repo:fork',
  'User-Agent':	'Bitbucket-Webhooks/2.0',
  'X-Attempt-Number': 1,
  'X-Hook-UUID':	'0302255c-f4f0-4232-916b-bef521fbdd08',
  'Content-Type': 'application/json'
};
