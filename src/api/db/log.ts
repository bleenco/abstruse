import { Log } from './model';

export interface LogType {
  type: 'info' | 'warning' | 'error';
  message: string;
}

export function insertLog(data: LogType): Promise<any> {
  return new Promise((resolve, reject) => {
    new Log(data).save(null, { method: 'insert' })
      .then(log => !log ? reject(log) : resolve(log.toJSON()));
  });
}

export function getLogs(
  limit: number,
  offset: number,
  type?: 'info' | 'warning' | 'error'
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    new Log().query(q => {
      if (type) {
        q.where('type', type);
      }

      q.orderBy('id', 'desc');
      q.limit(limit);
      q.offset(offset);
    })
    .fetchAll()
    .then(logs => !logs ? reject(logs) : resolve(logs.toJSON()));
  });
}
