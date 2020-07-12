export class Profile {
  constructor(public email: string, public name: string, public avatar: string, public location: string) {}
}

export class User extends Profile {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public avatar: string,
    public location: string,
    public role: string,
    public lastLogin: Date
  ) {
    super(email, name, avatar, location);
  }
}

export const generateProfile = (data: any): Profile => {
  return new Profile(data.email, data.name, data.avatar, data.location);
};

export const generateUser = (data: any): User => {
  return new User(data.id, data.email, data.name, data.avatar, data.location, data.role, data.lastLogin);
};
