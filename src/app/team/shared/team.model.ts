export class User {
  password: string;
  confirmPassword: string;

  constructor(
    public email: string,
    public fullname: string,
    public avatar: string,
    public admin: boolean
  ) { }
}
