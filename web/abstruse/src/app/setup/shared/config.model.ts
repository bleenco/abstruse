export class Config {
  constructor(
    public auth: ConfigAuth,
    public db: ConfigDB,
    public etcd: ConfigEtcd,
    public http: ConfigHTTP,
    public log: ConfigLog,
    public tls: ConfigTLS
  ) {}
}

export class ConfigAuth {
  constructor(public jwtSecret: string, public jwtExpiry: string, public jwtRefreshExpiry: string) {}
}

export class ConfigDB {
  constructor(
    public charset: string,
    public driver: string,
    public host: string,
    public name: string,
    public password: string,
    public port: number,
    public user: string
  ) {}
}

export class ConfigEtcd {
  constructor(
    public name: string,
    public host: string,
    public clientPort: number,
    public peerPort: number,
    public dataDir: string,
    public username: string,
    public password: string,
    public rootPassword: string
  ) {}
}

export class ConfigHTTP {
  constructor(public addr: string, public tls: boolean) {}
}

export class ConfigLog {
  constructor(
    public filename: string,
    public maxsize: number,
    public maxbackups: number,
    public maxage: number,
    public level: 'warn' | 'info' | 'debug' | 'fatal' | 'panic' | 'error',
    public stdout: boolean
  ) {}
}

export class ConfigTLS {
  constructor(public cert: string, public key: string) {}
}

export const generateConfigAuth = (data: any): ConfigAuth => {
  return new ConfigAuth(data.jwtSecret, data.jwtExpiry, data.jwtRefreshExpiry);
};

export const generateConfigDB = (data: any): ConfigDB => {
  return new ConfigDB(data.charset, data.driver, data.host, data.name, data.password, Number(data.port), data.user);
};

export const generateConfigEtcd = (data: any): ConfigEtcd => {
  return new ConfigEtcd(
    data.name,
    data.host,
    data.clientPort,
    data.peerPort,
    data.dataDir,
    data.username,
    data.password,
    data.rootPassword
  );
};

export const generateConfigHTTP = (data: any): ConfigHTTP => {
  return new ConfigHTTP(data.addr, Boolean(data.tls));
};

export const generateConfigTLS = (data: any): ConfigTLS => {
  return new ConfigTLS(data.cert, data.key);
};

export const generateConfigLog = (data: any): ConfigLog => {
  return new ConfigLog(
    data.filename,
    Number(data.maxsize),
    Number(data.maxbackups),
    Number(data.maxage),
    data.level,
    Boolean(data.stdout)
  );
};

export const generateConfig = (data: any): Config => {
  return new Config(
    generateConfigAuth(data.auth),
    generateConfigDB(data.db),
    generateConfigEtcd(data.etcd),
    generateConfigHTTP(data.http),
    generateConfigLog(data.log),
    generateConfigTLS(data.tls)
  );
};
