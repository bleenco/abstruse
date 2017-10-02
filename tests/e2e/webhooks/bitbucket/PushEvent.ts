export let request = {
  'push': {
    'changes': [
      {
        'forced': false,
        'old': {
          'type': 'branch',
          'name': 'test',
          'links': {
            'commits': {
              'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/commits/test'
            },
            'self': {
              'href':
                'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/refs/branches/test'
            },
            'html': {
              'href': 'https://bitbucket.org/Izak88/d3-bundle/branch/test'
            }
          },
          'target': {
            'hash': 'c465eec831e2719a18f025361c2d4e061ca764db',
            'links': {
              'self': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/'
                        + 'commit/c465eec831e2719a18f025361c2d4e061ca764db'
              },
              'html': {
                'href': 'https://bitbucket.org/Izak88/d3-bundle/commits/'
                        + 'c465eec831e2719a18f025361c2d4e061ca764db'
              }
            },
            'author': {
              'raw': 'Izak Lipnik <izak.lipnik@gmail.com>',
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
            'parents': [
              {
                'type': 'commit',
                'hash': '187cca05434b5888c9b8e3bf2c60545877bb1b8a',
                'links': {
                  'self': {
                    'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/'
                            + 'd3-bundle/commit/187cca05434b5888c9b8e3bf2c60545877bb1b8a'
                  },
                  'html': {
                    'href': 'https://bitbucket.org/Izak88/d3-bundle/commits'
                            + '/187cca05434b5888c9b8e3bf2c60545877bb1b8a'
                  }
                }
              }
            ],
            'date': '2017-10-02T06:46:46+00:00',
            'message': 'test\n',
            'type': 'commit'
          }
        },
        'links': {
          'commits': {
            'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/commits?'
                    + 'include=47f058cef3a3fe785b93e7fcda061bb32bf6655e&exclude='
                    + 'c465eec831e2719a18f025361c2d4e061ca764db'
          },
          'html': {
            'href': 'https://bitbucket.org/Izak88/d3-bundle/branches/compare/47f058cef3a3fe78'
                    + '5b93e7fcda061bb32bf6655e..c465eec831e2719a18f025361c2d4e061ca764db'
          },
          'diff': {
            'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/diff/47f058cef3'
                    + 'a3fe785b93e7fcda061bb32bf6655e..c465eec831e2719a18f025361c2d4e061ca764db'
          }
        },
        'truncated': false,
        'commits': [
          {
            'hash': '47f058cef3a3fe785b93e7fcda061bb32bf6655e',
            'links': {
              'self': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/commit/'
                        + '47f058cef3a3fe785b93e7fcda061bb32bf6655e'
              },
              'comments': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/commit/'
                        + '47f058cef3a3fe785b93e7fcda061bb32bf6655e/comments'
              },
              'patch': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/'
                        + 'patch/47f058cef3a3fe785b93e7fcda061bb32bf6655e'
              },
              'html': {
                'href': 'https://bitbucket.org/Izak88/d3-bundle/commits/'
                        + '47f058cef3a3fe785b93e7fcda061bb32bf6655e'
              },
              'diff': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle'
                        + '/diff/47f058cef3a3fe785b93e7fcda061bb32bf6655e'
              },
              'approve': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/'
                        + 'commit/47f058cef3a3fe785b93e7fcda061bb32bf6655e/approve'
              },
              'statuses': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/'
                        + 'commit/47f058cef3a3fe785b93e7fcda061bb32bf6655e/statuses'
              }
            },
            'author': {
              'raw': 'Izak Lipnik <izak.lipnik@gmail.com>',
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
            'parents': [
              {
                'type': 'commit',
                'hash': 'c465eec831e2719a18f025361c2d4e061ca764db',
                'links': {
                  'self': {
                    'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/'
                            + 'commit/c465eec831e2719a18f025361c2d4e061ca764db'
                  },
                  'html': {
                    'href': 'https://bitbucket.org/Izak88/d3-bundle/commits/'
                            + 'c465eec831e2719a18f025361c2d4e061ca764db'
                  }
                }
              }
            ],
            'date': '2017-10-02T06:49:39+00:00',
            'message': 'test\n',
            'type': 'commit'
          }
        ],
        'created': false,
        'closed': false,
        'new': {
          'type': 'branch',
          'name': 'test',
          'links': {
            'commits': {
              'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/commits/test'
            },
            'self': {
              'href':
                'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/refs/branches/test'
            },
            'html': {
              'href': 'https://bitbucket.org/Izak88/d3-bundle/branch/test'
            }
          },
          'target': {
            'hash': '47f058cef3a3fe785b93e7fcda061bb32bf6655e',
            'links': {
              'self': {
                'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle/'
                        + 'commit/47f058cef3a3fe785b93e7fcda061bb32bf6655e'
              },
              'html': {
                'href': 'https://bitbucket.org/Izak88/d3-bundle/commits'
                        + '/47f058cef3a3fe785b93e7fcda061bb32bf6655e'
              }
            },
            'author': {
              'raw': 'Izak Lipnik <izak.lipnik@gmail.com>',
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
            'parents': [
              {
                'type': 'commit',
                'hash': 'c465eec831e2719a18f025361c2d4e061ca764db',
                'links': {
                  'self': {
                    'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/'
                            + 'd3-bundle/commit/c465eec831e2719a18f025361c2d4e061ca764db'
                  },
                  'html': {
                    'href': 'https://bitbucket.org/Izak88/d3-bundle/'
                            + 'commits/c465eec831e2719a18f025361c2d4e061ca764db'
                  }
                }
              }
            ],
            'date': '2017-10-02T06:49:39+00:00',
            'message': 'test\n',
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
    'name': 'd3-bundle',
    'links': {
      'self': {
        'href': 'https://api.bitbucket.org/2.0/repositories/Izak88/d3-bundle'
      },
      'html': {
        'href': 'https://bitbucket.org/Izak88/d3-bundle'
      },
      'avatar': {
        'href': 'https://bitbucket.org/Izak88/d3-bundle/avatar/32/'
      }
    },
    'full_name': 'Izak88/d3-bundle',
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
    'is_private': true,
    'uuid': '{a6fa13bf-643a-45f6-a0b2-7324954878de}'
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
