export class Profile {
  constructor(public email: string, public name: string, public avatar: string) {}
}

export class User extends Profile {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public avatar: string,
    public role: string,
    public teams?: Team[]
  ) {
    super(email, name, avatar);
  }

  get teamsCount(): number {
    return this.teams && this.teams.length ? this.teams.length : 0;
  }
}

export const generateProfile = (data: any): Profile => {
  return new Profile(data.email, data.name, data.avatar);
};

export const generateUser = (data: any): User => {
  return new User(
    data.id,
    data.email,
    data.name,
    data.avatar,
    data.role,
    data.teams && data.teams.length ? data.teams.map(generateTeam) : []
  );
};

export class Team {
  constructor(
    public id: number,
    public name: string,
    public about: string,
    public color: string,
    public users: User[]
  ) {}

  get placeholder(): string {
    const splitted = this.name.split('');
    const len = splitted.length;
    if (len === 1) {
      return this.name.substring(0, 2).toUpperCase();
    } else {
      return `${splitted[0].substring(0, 1)}${splitted[1].substring(0, 1)}`.toUpperCase();
    }
  }

  get membersCount(): string {
    if (this.users.length === 1) {
      return '1 member';
    } else {
      return `${this.users.length} members`;
    }
  }
}

export function generateTeam(data: any): Team {
  return new Team(
    data.id,
    data.name,
    data.about,
    data.color,
    data.users && data.users.lenth ? data.users.map(generateUser) : []
  );
}
