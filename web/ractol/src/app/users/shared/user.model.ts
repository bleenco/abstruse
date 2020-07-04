export class User {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public avatar: string,
    public admin: boolean
  ) {}
}

export const generateUser = (data: any): User => {
  return new User(data.id, data.email, data.name, data.avatar, Boolean(data.admin));
};
