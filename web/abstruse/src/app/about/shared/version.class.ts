export class Version {
  constructor(
    public api: string,
    public ui: string,
    public commit_hash: string,
    public build_date: Date
  ) { }
}
