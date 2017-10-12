import { ToTimePipe } from './to-time.pipe';

describe('ToTimePipe', () => {
  let pipe: ToTimePipe;

  beforeEach(() => {
    pipe = new ToTimePipe();
  });

  it('transform time', () => {
    const value = pipe.transform(123124646);
    expect(value).toBe('10:12:04');
  });

});
