import { User } from '../../users/shared/user.model';
import { randomHash } from '../../shared';

export class Provider {
  constructor(
    public id?: number,
    public name?: string,
    public url?: string,
    public secret?: string,
    public accessToken?: string,
    public userId?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public user?: User
  ) {
    this.secret = this.secret || randomHash(12);
  }

  get getName(): string {
    switch (this.name) {
      case 'github':
        return 'GitHub';
      case 'gitlab':
        return 'GitLab';
      case 'bitbucket':
        return 'BitBucket';
      case 'gogs':
        return 'Gogs';
      case 'gitea':
        return 'Gitea';
      case 'stash':
        return 'Stash';
      default:
        return 'unknown provider';
    }
  }
}
