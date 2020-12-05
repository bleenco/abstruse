export class Profile {
  constructor(public email: string, public name: string, public avatar: string) {}
}

export class User extends Profile {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public avatar: string,
    public role: string
  ) {
    super(email, name, avatar);
  }
}

export const generateProfile = (data: any): Profile => {
  return new Profile(data.email, data.name, data.avatar);
};

export const generateUser = (data: any): User => {
  return new User(data.id, data.email, data.name, data.avatar, data.role);
};
