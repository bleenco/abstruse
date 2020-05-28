export class Integration {
  constructor(
    public id: number,
    public provider: string,
    public URL: string,
    public apiURL: string,
    public createdAt: Date,
    public updatedAt: Date,
    public username: string = '',
    public password: string = '',
    public accessToken: string = ''
  ) { }
}
