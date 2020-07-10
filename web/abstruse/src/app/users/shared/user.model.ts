export class User {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public avatar: string,
    public role: string,
    public lastLogin: Date
  ) {}
}

export const generateUser = (data: any): User => {
  return new User(data.id, data.email, data.name, data.avatar, data.role, data.lastLogin);
};
