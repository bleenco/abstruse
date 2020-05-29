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
    public gitUrl?: string,
    public defaultBranch?: string,
    public visibility?: string,
    public userId?: number,
    public providerId?: number,
    public createdAt?: Date,
    public updatedAt?: Date
  ) { }
}

export function generateRepoModel(data: any): Repo {
  return new Repo(
    data.id,
    data.uid,
    data.provider_name,
    data.namespace,
    data.name,
    data.full_name,
    Boolean(data.private),
    Boolean(data.fork),
    data.url,
    data.git_url,
    data.default_branch,
    data.visibility,
    Number(data.user_id),
    Number(data.provider_id),
    new Date(data.created_at ? data.created_at : null),
    new Date(data.updated_at ? data.updated_at : null)
  );
}
