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
    public gitURL?: string,
    public defaultBranch?: string,
    public visibility?: string,
    public userID?: number,
    public providerID?: number,
    public createdAt?: Date,
    public updatedAt?: Date
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
    data.gitURL,
    data.defaultBranch,
    data.visibility,
    Number(data.userID),
    Number(data.providerID),
    new Date(data.createdAt ? data.createdAt : null),
    new Date(data.updatedAt ? data.updatedAt : null)
  );
}
