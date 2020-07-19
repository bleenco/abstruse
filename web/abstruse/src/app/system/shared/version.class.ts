export class Version {
  constructor(
    public api: string,
    public ui: string,
    public commitHash: string,
    public buildDate: Date,
    public os: string,
    public arch: string
  ) {}

  get getCommit(): string {
    return this.commitHash.substring(0, 6);
  }
}

export const generateVersion = (data: any): Version => {
  return new Version(data.api, data.ui, data.commitHash, data.buildDate, data.os, data.arch);
};
