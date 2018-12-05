export class Team {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public color: string,
    public is_deletable: boolean,
    public users?: any[],
    public permissions?: any[]
  ) { }

  getInitials(): string {
    return this.title
      .split(/\s/)
      .reduce((response, word) => response += word.slice(0, 1), '')
      .toUpperCase();
  }
}
