import { ExpressServer } from './server';

const server = new ExpressServer({ port: 6500 });
server.start().subscribe(data => {
  console.log(data);
}, err => {
  console.error(err);
}, () => {
  console.log('Done.');
});
