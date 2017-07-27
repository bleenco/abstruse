export let request = {
  'action': 'removed',
  'installation': {
    'id': 2,
    'account': {
      'login': 'octocat',
      'id': 1,
      'avatar_url': 'https://github.com/images/error/octocat_happy.gif',
      'gravatar_id': '',
      'url': 'https://api.github.com/users/octocat',
      'html_url': 'https://github.com/octocat',
      'followers_url': 'https://api.github.com/users/octocat/followers',
      'following_url': 'https://api.github.com/users/octocat/following{/other_user}',
      'gists_url': 'https://api.github.com/users/octocat/gists{/gist_id}',
      'starred_url': 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
      'subscriptions_url': 'https://api.github.com/users/octocat/subscriptions',
      'organizations_url': 'https://api.github.com/users/octocat/orgs',
      'repos_url': 'https://api.github.com/users/octocat/repos',
      'events_url': 'https://api.github.com/users/octocat/events{/privacy}',
      'received_events_url': 'https://api.github.com/users/octocat/received_events',
      'type': 'User',
      'site_admin': false
    },
    'repository_selection': 'selected',
    'access_tokens_url': 'https://api.github.com/installations/2/access_tokens',
    'repositories_url': 'https://api.github.com/installation/repositories',
    'html_url': 'https://github.com/settings/installations/2'
  },
  'repository_selection': 'selected',
  'repositories_added': [

  ],
  'repositories_removed': [
    {
      'id': 1296269,
      'name': 'Hello-World',
      'full_name': 'octocat/Hello-World'
    }
  ],
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
  }
};

export let header = {
  'content-type': 'application/json',
  'X-GitHub-Event': 'installation_repositories',
  'X-Hub-Signature': 'sha1=b7c49c4f28d64c153ae1ab7f7a8627a1f66a9e55',
  'X-GitHub-Delivery': '61109660-71f6-11e7-9b49-619c5e386bdf'
};
