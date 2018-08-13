export class User {
  constructor(
    public email: string = '',
    public fullname: string = '',
    public password: string = '',
    public confirmPassword: string = '',
    public avatar: string = '',
    public admin: boolean = false
  ) { }
}
