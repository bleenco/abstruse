export class Repo {
  constructor(
    public id?: number,
    public uid?: string,
    public providerName?: string,
    public namespace?: string,
    public name?: string,
    public fullName?: string,
    public isPrivate?: boolean,
    public fork?: boolean,
    public url?: string,
    public clone?: string,
    public cloneSSH?: string,
    public defaultBranch?: string,
    public active?: boolean,
    public timeout?: number,
    public token?: string,
    public userID?: number,
    public providerID?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public perms?: Perms
  ) {}
}

export function generateRepoModel(data: any): Repo {
  return new Repo(
    Number(data.id),
    data.uid,
    data.providerName,
    data.namespace,
    data.name,
    data.fullName,
    Boolean(data.private),
    Boolean(data.fork),
    data.url,
    data.clone,
    data.cloneSSH,
    data.defaultBranch,
    Boolean(data.active),
    Number(data.timeout),
    data.token,
    Number(data.userID),
    Number(data.providerID),
    new Date(data.createdAt ? data.createdAt : null),
    new Date(data.updatedAt ? data.updatedAt : null),
    data.perms || { read: false, write: false, exec: false }
  );
}

export interface Perms {
  read: boolean;
  write: boolean;
  exec: boolean;
}
