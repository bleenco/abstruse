export class Session {
  constructor(
    public id: number,
    public token: string,
    public expiresAt: Date,
    public os: string,
    public platform: string,
    public browser: string,
    public engine: string,
    public mobile: boolean,
    public ip: string,
    public userID: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export const generateSession = (data: any): Session => {
  return new Session(
    data.id,
    data.token,
    new Date(data.expiresAt),
    data.os,
    data.platform,
    data.browser,
    data.engine,
    data.mobile,
    data.ip,
    data.userID,
    new Date(data.createdAt),
    new Date(data.updatedAt)
  );
};
