import { Log } from './model';
import { LogMessageType } from '../logger';

export function insertLog(data: LogMessageType): Promise<LogMessageType> {
  return new Promise((resolve, reject) => {
    new Log(data).save(null, { method: 'insert' })
      .then(log => !log ? reject(log) : resolve(data));
  });
}

export function getLogs(
  limit: number,
  offset: number,
  type?: 'all' | 'info' | 'warning' | 'error'
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    new Log().query(q => {
      if (type !== 'all') {
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
