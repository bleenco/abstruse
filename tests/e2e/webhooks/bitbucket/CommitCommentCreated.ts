export let request = {
  'comment': {
    'links': {
      'self': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88'
                + '/test/commit/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505/comments/5024572'
      },
      'html': {
        'href': 'https://bitbucket.org/Izak88/test/commits'
                + '/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505#comment-5024572'
      }
    },
    'content': {
      'raw': 'test',
      'markup': 'markdown',
      'html': '<p>test</p>'
    },
    'created_on': '2017-08-01T10:54:04.968490+00:00',
    'user': {
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
    'updated_on': '2017-08-01T10:54:04.972161+00:00',
    'commit': {
      'type': 'commit',
      'hash': '5fe88c29cc81b6c25d82f2b772a6ec77c8b91505',
      'links': {
        'self': {
          'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/'
                  + 'test/commit/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
        },
        'html': {
          'href': 'https://bitbucket.org/Izak88/test/'
                  + 'commits/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
        }
      }
    },
    'id': 5024572
  },
  'commit': {
    'type': 'base_commit',
    'message': 'README.md created online with Bitbucket',
    'hash': '5fe88c29cc81b6c25d82f2b772a6ec77c8b91505',
    'links': {}
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
  'X-Event-Key':	'repo:commit_comment_created',
  'User-Agent':	'Bitbucket-Webhooks/2.0',
  'X-Attempt-Number': 1,
  'X-Hook-UUID':	'0302255c-f4f0-4232-916b-bef521fbdd08',
  'Content-Type': 'application/json'
};
