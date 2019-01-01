export class User {
  constructor(
    public id: number,
    public email: string,
    public fullname: string,
    public avatar: string,
    public totp_enabled: boolean,
    public totp_account_name: string
  ) { }
}
