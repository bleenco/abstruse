import { User } from '../../users/shared/user.model';
import { randomHash } from '../../shared';

export class Provider {
  constructor(
    public id?: number,
    public name?: string,
    public url?: string,
    public secret?: string,
    public accessToken?: string,
    public userID?: number,
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

export const generateProvider = (data: any): Provider => {
  return new Provider(
    data.id,
    data.name,
    data.url,
    data.secret,
    data.accessToken,
    data.userID,
    new Date(data.createdAt),
    new Date(data.updatedAt)
  );
};
