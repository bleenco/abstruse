export class Repository {
  constructor(
    public id: number,
    public name: string,
    public full_name: string,
    public repository_provider: string,
    public repository_provider_id: string | number,
    public html_url: string,
    public api_url: string,
    public default_branch: string,
    public description: string,
    public is_fork: boolean,
    public is_public: boolean,
    public access_tokens_id: number,
  ) { }
}
