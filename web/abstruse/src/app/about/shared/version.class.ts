export class Version {
  constructor(
    public api: string,
    public ui: string,
    public commitHash: string,
    public buildDate: Date
  ) { }
}
