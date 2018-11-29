import { ToTimePipe } from './to-time.pipe';

describe('ToTimePipe', () => {
  it('create an instance', () => {
    const pipe = new ToTimePipe();
    expect(pipe).toBeTruthy();
  });
});
