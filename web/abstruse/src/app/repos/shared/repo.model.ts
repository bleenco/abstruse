export class Repo {
  constructor(
    public id: number,
    public uid: string,
    public name: string,
    public fullName: string,
    public url: string,
    public gitUrl: string,
    public homepage: string,
    public htmlUrl: string,
    public language: string,
    public defaultBranch: string,
    public masterBranch: string,
    public description: string,
    public fork: boolean,
    public provider: string,
    public providerId: number,
    public size: number,
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export function generateRepoModel(data: any): Repo {
  return new Repo(
    data.id,
    data.uid,
    data.name,
    data.full_name,
    data.url,
    data.git_url,
    data.homepage,
    data.html_url,
    data.language,
    data.default_branch,
    data.master_branch,
    data.description,
    Boolean(data.fork),
    data.provider,
    data.provider_id,
    Number(data.size),
    new Date(data.created_at ? data.created_at : null),
    new Date(data.updated_at ? data.updated_at : null)
  );
}
