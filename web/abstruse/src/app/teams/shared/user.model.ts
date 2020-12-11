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
    public id?: number,
    public name?: string,
    public about?: string,
    public color?: string,
    public users?: User[],
    public repos?: RepoPermission[]
  ) {}

  get membersCount(): string {
    if (!this.users || !this.users.length) {
      return '0 Members';
    }

    if (this.users.length === 1) {
      return '1 Member';
    } else {
      return `${this.users.length} Members`;
    }
  }

  get reposCount(): string {
    if (!this.repos || !this.repos.length) {
      return '0 Repositories';
    }
    if (this.repos.length === 1) {
      return '1 Repository';
    } else {
      return `${this.repos.length} Repositories`;
    }
  }
}

export function generateTeam(data: any): Team {
  return new Team(
    data.id,
    data.name,
    data.about,
    data.color,
    data.users && data.users.length ? data.users.map(generateUser) : [],
    data.perms && data.perms.length ? data.perms.map(generatePerms) : []
  );
}

export class RepoPermission {
  constructor(
    public repoID: number,
    public repoFullName: string,
    public read: boolean,
    public write: boolean,
    public exec: boolean
  ) {}
}

export function generatePerms(data: any): RepoPermission {
  return new RepoPermission(
    data.repository.id,
    data.repository.fullName,
    Boolean(data.read),
    Boolean(data.write),
    Boolean(data.exec)
  );
}
