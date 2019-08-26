export class Repo {
  constructor(
    public id: number,
    public name: string,
    public full_name: string,
    public url: string,
    public git_url: string,
    public homepage: string,
    public html_url: string,
    public language: string,
    public default_branch: string,
    public master_branch: string,
    public description: string,
    public fork: boolean,
    public provider: string,
    public provider_id: number,
    public size: number,
    public created_at: Date,
    public updated_at: Date
  ) { }
}

export function generateRepoModel(data: any): Repo {
  return new Repo(
    data.id,
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
