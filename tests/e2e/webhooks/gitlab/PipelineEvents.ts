export let request = {
   'object_kind': 'pipeline',
   'object_attributes': {
      'id': 31,
      'ref': 'master',
      'tag': false,
      'sha': 'bcbb5ec396a2c0f828686f14fac9b80b780504f2',
      'before_sha': 'bcbb5ec396a2c0f828686f14fac9b80b780504f2',
      'status': 'success',
      'stages': [
         'build',
         'test',
         'deploy'
      ],
      'created_at': '2016-08-12 15:23:28 UTC',
      'finished_at': '2016-08-12 15:26:29 UTC',
      'duration': 63
   },
   'user': {
      'name': 'Administrator',
      'username': 'root',
      'avatar_url':
        'http://www.gravatar.com/avatar/e32bd13e2add097461cb96824b7a829c?s=80\u0026d=identicon'
   },
   'project': {
      'name': 'Gitlab Test',
      'description': 'Atque in sunt eos similique dolores voluptatem.',
      'web_url': 'http://192.168.64.1:3005/gitlab-org/gitlab-test',
      'avatar_url': null,
      'git_ssh_url': 'git@192.168.64.1:gitlab-org/gitlab-test.git',
      'git_http_url': 'http://192.168.64.1:3005/gitlab-org/gitlab-test.git',
      'namespace': 'Gitlab Org',
      'visibility_level': 20,
      'path_with_namespace': 'gitlab-org/gitlab-test',
      'default_branch': 'master'
   },
   'commit': {
      'id': 'bcbb5ec396a2c0f828686f14fac9b80b780504f2',
      'message': 'test\n',
      'timestamp': '2016-08-12T17:23:21+02:00',
      'url':
        'http://example.com/gitlab-org/gitlab-test/commit/bcbb5ec396a2c0f828686f14fac9b80b780504f2',
      'author': {
         'name': 'User',
         'email': 'user@gitlab.com'
      }
   },
   'builds': [
      {
         'id': 380,
         'stage': 'deploy',
         'name': 'production',
         'status': 'skipped',
         'created_at': '2016-08-12 15:23:28 UTC',
         'started_at': null,
         'finished_at': null,
         'when': 'manual',
         'manual': true,
         'user': {
            'name': 'Administrator',
            'username': 'root',
            'avatar_url':
             'http://www.gravatar.com/avatar/e32bd13e2add097461cb96824b7a829c?s=80\u0026d=identicon'
         },
         'runner': null,
         'artifacts_file': {
            'filename': null,
            'size': null
         }
      },
      {
         'id': 377,
         'stage': 'test',
         'name': 'test-image',
         'status': 'success',
         'created_at': '2016-08-12 15:23:28 UTC',
         'started_at': '2016-08-12 15:26:12 UTC',
         'finished_at': null,
         'when': 'on_success',
         'manual': false,
         'user': {
            'name': 'Administrator',
            'username': 'root',
            'avatar_url':
             'http://www.gravatar.com/avatar/e32bd13e2add097461cb96824b7a829c?s=80\u0026d=identicon'
         },
         'runner': null,
         'artifacts_file': {
            'filename': null,
            'size': null
         }
      },
      {
         'id': 378,
         'stage': 'test',
         'name': 'test-build',
         'status': 'success',
         'created_at': '2016-08-12 15:23:28 UTC',
         'started_at': '2016-08-12 15:26:12 UTC',
         'finished_at': '2016-08-12 15:26:29 UTC',
         'when': 'on_success',
         'manual': false,
         'user': {
            'name': 'Administrator',
            'username': 'root',
            'avatar_url':
             'http://www.gravatar.com/avatar/e32bd13e2add097461cb96824b7a829c?s=80\u0026d=identicon'
         },
         'runner': null,
         'artifacts_file': {
            'filename': null,
            'size': null
         }
      },
      {
         'id': 376,
         'stage': 'build',
         'name': 'build-image',
         'status': 'success',
         'created_at': '2016-08-12 15:23:28 UTC',
         'started_at': '2016-08-12 15:24:56 UTC',
         'finished_at': '2016-08-12 15:25:26 UTC',
         'when': 'on_success',
         'manual': false,
         'user': {
            'name': 'Administrator',
            'username': 'root',
            'avatar_url':
             'http://www.gravatar.com/avatar/e32bd13e2add097461cb96824b7a829c?s=80\u0026d=identicon'
         },
         'runner': null,
         'artifacts_file': {
            'filename': null,
            'size': null
         }
      },
      {
         'id': 379,
         'stage': 'deploy',
         'name': 'staging',
         'status': 'created',
         'created_at': '2016-08-12 15:23:28 UTC',
         'started_at': null,
         'finished_at': null,
         'when': 'on_success',
         'manual': false,
         'user': {
            'name': 'Administrator',
            'username': 'root',
            'avatar_url':
             'http://www.gravatar.com/avatar/e32bd13e2add097461cb96824b7a829c?s=80\u0026d=identicon'
         },
         'runner': null,
         'artifacts_file': {
            'filename': null,
            'size': null
         }
      }
   ]
};

export let header = {
  'Content-Type': 'application/json',
  'X-Gitlab-Event': 'Pipeline Hook',
  'X-Gitlab-Token': 'thisIsSecret'
};
