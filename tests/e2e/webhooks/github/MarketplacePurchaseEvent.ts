export let request = {
  'action': 'changed',
  'effective_date': '2017-04-06T02:01:16Z',
  'marketplace_purchase': {
    'account': {
      'type': 'Organization',
      'id': 4,
      'login': 'GitHub',
      'organization_billing_email': 'billing@github.com'
    },
    'billing_cycle': 'monthly',
    'next_billing_date': '2017-05-01T00:00:00Z',
    'unit_count': 1,
    'plan': {
      'id': 9,
      'name': 'Super Pro',
      'description': 'A really, super professional-grade CI solution',
      'monthly_price_in_cents': 9999,
      'yearly_price_in_cents': 11998,
      'price_model': 'flat-rate',
      'unit_name': null,
      'bullets': [
        'This is the first bullet of the plan',
        'This is the second bullet of the plan'
      ]
    }
  },
  'previous_marketplace_purchase': {
    'account': {
      'type': 'Organization',
      'id': 4,
      'login': 'GitHub'
    },
    'billing_cycle': 'monthly',
    'next_billing_date': '2017-05-01T00:00:00Z',
    'unit_count': 1,
    'plan': {
      'id': 9,
      'name': 'Super Pro',
      'description': 'A really, super professional-grade CI solution',
      'monthly_price_in_cents': 9999,
      'yearly_price_in_cents': 11998,
      'price_model': 'flat-rate',
      'unit_name': null,
      'bullets': [
        'This is the first bullet of the plan',
        'This is the second bullet of the plan'
      ]
    }
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
  }
};

export let header = {
  'content-type': 'application/json',
  'X-GitHub-Event': 'marketplace_purchase',
  'X-Hub-Signature': 'sha1=b7c49c4f28d64c153ae1ab7f7a8627a1f66a9e55',
  'X-GitHub-Delivery': '61109660-71f6-11e7-9b49-619c5e386bdf'
};
