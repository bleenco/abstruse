export class Admin {
  readonly role: string = 'admin';
  readonly active: boolean = true;

  constructor(
    public email: string,
    public login: string,
    public name: string,
    public avatar: string,
    public password: string
  ) {}
}

export const generateAdminModel = (data: any): Admin => {
  return new Admin(data.email, data.login, data.name, data.avatar, data.password);
};
