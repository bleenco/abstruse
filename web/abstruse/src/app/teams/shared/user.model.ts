export class User {
  constructor(
    public id: number,
    public email: string,
    public fullName: string,
    public avatar: string,
    public admin: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
