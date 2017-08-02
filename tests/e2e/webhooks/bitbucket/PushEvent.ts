export let request = {
  'push': {
    'changes': [
      {
        'forced': false,
        'old': null,
        'links': {
          'commits': {
            'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/commits?'
                    + 'include=5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
          },
          'html': {
            'href': 'https://bitbucket.org/Izak88/test/branch/master'
          }
        },
        'truncated': false,
        'commits': [
          {
            'hash': '5fe88c29cc81b6c25d82f2b772a6ec77c8b91505',
            'links': {
              'self': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88'
                        + '/test/commit/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
              },
              'comments': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/commit/'
                        + '5fe88c29cc81b6c25d82f2b772a6ec77c8b91505/comments'
              },
              'patch': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test'
                        + '/patch/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
              },
              'html': {
                'href': 'https://bitbucket.org/Izak88/test/commits'
                        + '/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
              },
              'diff': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88'
                        + '/test/diff/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
              },
              'approve': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88'
                        + '/test/commit/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505/approve'
              },
              'statuses': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88'
                        + '/test/commit/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505/statuses'
              }
            },
            'author': {
              'raw': 'Izak <izak.lipnik@gmail.com>',
              'type': 'author',
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
              }
            },
            'parents': [],
            'date': '2017-08-01T07:41:01+00:00',
            'message': 'README.md created online with Bitbucket',
            'type': 'commit'
          }
        ],
        'created': true,
        'closed': false,
        'new': {
          'type': 'branch',
          'name': 'master',
          'links': {
            'commits': {
              'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/commits/master'
            },
            'self': {
              'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/test/refs/branches/master'
            },
            'html': {
              'href': 'https://bitbucket.org/Izak88/test/branch/master'
            }
          },
          'target': {
            'hash': '5fe88c29cc81b6c25d82f2b772a6ec77c8b91505',
            'links': {
              'self': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88'
                        + '/test/commit/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
              },
              'html': {
                'href': 'https://bitbucket.org/Izak88/test/commits'
                        + '/5fe88c29cc81b6c25d82f2b772a6ec77c8b91505'
              }
            },
            'author': {
              'raw': 'Izak <izak.lipnik@gmail.com>',
              'type': 'author',
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
              }
            },
            'parents': [],
            'date': '2017-08-01T07:41:01+00:00',
            'message': 'README.md created online with Bitbucket',
            'type': 'commit'
          }
        }
      }
    ]
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
  'X-Event-Key':	'repo:push',
  'User-Agent':	'Bitbucket-Webhooks/2.0',
  'X-Attempt-Number': 1,
  'X-Hook-UUID':	'0302255c-f4f0-4232-916b-bef521fbdd08',
  'Content-Type': 'application/json'
};
