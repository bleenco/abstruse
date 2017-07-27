export let request = {
  'action': 'added',
  'scope': 'team',
  'member': {
    'login': 'kdaigle',
    'id': 2501,
    'avatar_url': 'https://avatars.githubusercontent.com/u/2501?v=3',
    'gravatar_id': '',
    'url': 'https://api.github.com/users/kdaigle',
    'html_url': 'https://github.com/kdaigle',
    'followers_url': 'https://api.github.com/users/kdaigle/followers',
    'following_url': 'https://api.github.com/users/kdaigle/following{/other_user}',
    'gists_url': 'https://api.github.com/users/kdaigle/gists{/gist_id}',
    'starred_url': 'https://api.github.com/users/kdaigle/starred{/owner}{/repo}',
    'subscriptions_url': 'https://api.github.com/users/kdaigle/subscriptions',
    'organizations_url': 'https://api.github.com/users/kdaigle/orgs',
    'repos_url': 'https://api.github.com/users/kdaigle/repos',
    'events_url': 'https://api.github.com/users/kdaigle/events{/privacy}',
    'received_events_url': 'https://api.github.com/users/kdaigle/received_events',
    'type': 'User',
    'site_admin': true
  },
  'sender': {
    'login': 'Izak88',
    'id': 8555269,
    'avatar_url': 'https://avatars0.githubusercontent.com/u/8555269?v=4',
    'gravatar_id': '',
    'url': 'https://api.github.com/users/Izak88',
    'html_url': 'https://github.com/Izak88',
    'followers_url': 'https://api.github.com/users/Izak88/followers',
    'following_url': 'https://api.github.com/users/Izak88/following{/other_user}',
    'gists_url': 'https://api.github.com/users/Izak88/gists{/gist_id}',
    'starred_url': 'https://api.github.com/users/Izak88/starred{/owner}{/repo}',
    'subscriptions_url': 'https://api.github.com/users/Izak88/subscriptions',
    'organizations_url': 'https://api.github.com/users/Izak88/orgs',
    'repos_url': 'https://api.github.com/users/Izak88/repos',
    'events_url': 'https://api.github.com/users/Izak88/events{/privacy}',
    'received_events_url': 'https://api.github.com/users/Izak88/received_events',
    'type': 'User',
    'site_admin': false
  },
  'team': {
    'name': 'Contractors',
    'id': 123456,
    'slug': 'contractors',
    'permission': 'admin',
    'url': 'https://api.github.com/teams/123456',
    'members_url': 'https://api.github.com/teams/123456/members{/member}',
    'repositories_url': 'https://api.github.com/teams/123456/repos'
  },
  'organization': {
    'login': 'baxterandthehackers',
    'id': 7649605,
    'url': 'https://api.github.com/orgs/baxterandthehackers',
    'repos_url': 'https://api.github.com/orgs/baxterandthehackers/repos',
    'events_url': 'https://api.github.com/orgs/baxterandthehackers/events',
    'members_url': 'https://api.github.com/orgs/baxterandthehackers/members{/member}',
    'public_members_url': 'https://api.github.com/orgs/baxterandthehackers/public_members{/member}',
    'avatar_url': 'https://avatars.githubusercontent.com/u/7649605?v=2'
  }
};

export let header = {
  'content-type': 'application/json',
  'X-GitHub-Event': 'membership',
  'X-Hub-Signature': 'sha1=b7c49c4f28d64c153ae1ab7f7a8627a1f66a9e55',
  'X-GitHub-Delivery': '61109660-71f6-11e7-9b49-619c5e386bdf'
};
