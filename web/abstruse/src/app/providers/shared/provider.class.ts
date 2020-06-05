import { User } from 'src/app/teams/shared/user.model';

export class Provider {
  constructor(
    public id?: number,
    public name?: string,
    public url?: string,
    public accessToken?: string,
    public userId?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public user?: User
  ) { }

  get getName(): string {
    switch (this.name) {
      case 'github': return 'GitHub';
      case 'gitlab': return 'GitLab';
      case 'bitbucket': return 'BitBucket';
      case 'gogs': return 'Gogs';
      case 'gitea': return 'Gitea';
      case 'stash': return 'Stash';
    }
  }
}
