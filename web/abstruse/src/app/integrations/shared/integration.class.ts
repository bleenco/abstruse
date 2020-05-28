export class Integration {
  constructor(
    public id: number,
    public provider: string,
    public url: string,
    public apiUrl: string,
    public username: string = '',
    public password: string = '',
    public accessToken: string = ''
  ) { }
}
