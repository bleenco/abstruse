export let request = {
  'commit_status': {
    'name': 'Unit Tests (Python)',
    'description': 'Build started',
    'state': 'INPROGRESS',
    'key': 'mybuildtool',
    'url': 'https://my-build-tool.com/builds/MY-PROJECT/BUILD-777',
    'type': 'build',
    'created_on': '2015-11-19T20:37:35.547563+00:00',
    'updated_on': '2015-11-19T20:37:35.547563+00:00',
    'links': {
      'commit': {
        'href': 'http://api.bitbucket.org/2.0/repositories/tk/test/'
                + 'commit/9fec847784abb10b2fa567ee63b85bd238955d0e'
      },
      'self': {
        'href': 'http://api.bitbucket.org/2.0/repositories/tk/test/commit/'
                + '9fec847784abb10b2fa567ee63b85bd238955d0e/statuses/build/mybuildtool'
      }
    }
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
  'X-Event-Key':	'repo:commit_status_created',
  'User-Agent':	'Bitbucket-Webhooks/2.0',
  'X-Attempt-Number': 1,
  'X-Hook-UUID':	'0302255c-f4f0-4232-916b-bef521fbdd08',
  'Content-Type': 'application/json'
};
