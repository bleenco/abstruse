import { User } from '../../teams/shared/user.model';
import { randomHash } from '../../shared';
import { formatDistanceToNow } from 'date-fns';

export class Provider {
  constructor(
    public id?: number,
    public name?: string,
    public url?: string,
    public host?: string,
    public secret?: string,
    public accessToken?: string,
    public HttpUser?: string,
    public HttpPass?: string,
    public lastSync?: Date | null,
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

  get lastSynced(): string {
    return `${formatDistanceToNow(this.lastSync as Date)} ago`;
  }
}

export const generateProvider = (data: any): Provider => {
  return new Provider(
    data.id,
    data.name,
    data.url,
    data.host,
    data.secret,
    data.accessToken,
    data.HttpUser,
    data.HttpPass,
    data.lastSync ? new Date(data.lastSync) : null,
    data.userID,
    new Date(data.createdAt),
    new Date(data.updatedAt)
  );
};
