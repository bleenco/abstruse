import { generateUser, User } from 'src/app/users/shared/user.model';

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
  return new Team(data.id, data.name, data.about, data.color, data.users.map(generateUser));
}
