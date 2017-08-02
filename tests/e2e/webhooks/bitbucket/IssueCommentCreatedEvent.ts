export let request = {
  'comment': {
    'links': {
      'self': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/issues/1/comments/38810867'
      },
      'html': {
        'href': 'https://bitbucket.org/Izak88/test/issues/1#comment-38810867'
      }
    },
    'content': {
      'raw': 'test',
      'markup': 'markdown',
      'html': '<p>test</p>'
    },
    'created_on': '2017-08-01T10:18:20.943758+00:00',
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
    'updated_on': null,
    'type': 'issue_comment',
    'id': 38810867
  },
  'issue': {
    'content': {
      'raw': 'test',
      'markup': 'markdown',
      'html': '<p>test</p>'
    },
    'kind': 'bug',
    'links': {
      'attachments': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/issues/1/attachments'
      },
      'self': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/issues/1'
      },
      'watch': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/issues/1/watch'
      },
      'comments': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/issues/1/comments'
      },
      'html': {
        'href': 'https://bitbucket.org/Izak88/test/issues/1/test-issue'
      },
      'vote': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/issues/1/vote'
      }
    },
    'reporter': {
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
    'title': 'test issue',
    'component': null,
    'votes': 0,
    'watches': 1,
    'priority': 'major',
    'assignee': null,
    'state': 'new',
    'version': null,
    'edited_on': null,
    'created_on': '2017-08-01T10:15:31.492510+00:00',
    'milestone': null,
    'updated_on': '2017-08-01T10:18:20.958095+00:00',
    'type': 'issue',
    'id': 1
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
  'X-Event-Key':	'issue:comment_created',
  'User-Agent':	'Bitbucket-Webhooks/2.0',
  'X-Attempt-Number': 1,
  'X-Hook-UUID':	'0302255c-f4f0-4232-916b-bef521fbdd08',
  'Content-Type': 'application/json'
};
