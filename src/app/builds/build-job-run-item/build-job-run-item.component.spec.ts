import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildJobRunItemComponent } from './build-job-run-item.component';
import { data } from '../../../testing/data/build-job-run-item.data';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  template: `<app-build-job-run-item [run]="run" [num]="num"></app-build-job-run-item>`
})
class TestComponent {
  run = data;
  num = 1;
}

describe('BuildJobRunItemComponent => Passed Job', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuildJobRunItemComponent, TestComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have job run number displayed`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .num-column'));
      const numEl = el.query(By.css('.num-title'));
      expect(numEl.nativeElement.textContent).not.toBe('');
    });
  }));

  it(`should have job run number displayed correctly`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .num-column'));
      const numEl = el.query(By.css('.num-title'));
      expect(numEl.nativeElement.textContent.trim()).toEqual('#1');
    });
  }));

  it(`should have "Start Date" item displayed`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.queryAll(By.css('.job-run-item .date-column'))[0];
      const dateEl = el.query(By.css('.date'));
      expect(el.nativeElement.textContent).not.toBe('');
    });
  }));

  it(`should have "Start Date" item displayed correctly`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.queryAll(By.css('.job-run-item .date-column'))[0];
      const dateEl = el.query(By.css('.date'));
      expect(dateEl.nativeElement.textContent.trim()).toEqual('Nov 20, 2018, 8:59:26 AM');
    });
  }));

  it(`should have "Finish Date" item displayed`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.queryAll(By.css('.job-run-item .date-column'))[1];
      const dateEl = el.query(By.css('.date'));
      expect(dateEl.nativeElement.textContent).not.toBe('');
    });
  }));

  it(`should have "Finish Date" item displayed correctly`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.queryAll(By.css('.job-run-item .date-column'))[1];
      const dateEl = el.query(By.css('.date'));
      expect(dateEl.nativeElement.textContent.trim()).toEqual('Nov 20, 2018, 8:59:54 AM');
    });
  }));

  it('should have running time calculated', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .time-column .time'));
      expect(el.nativeElement.textContent).not.toBe('');
    });
  }));

  it('should have running time calculated correctly', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .time-column .time'));
      expect(el.nativeElement.textContent).toEqual('00:28');
    });
  }));

  it('should have "is-passed" class enabled on status item', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .build-status-column .status-item'));
      expect(el.classes['is-passed']).toBeDefined();
    });
  }));

  it('should have "passed" status item displayed', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .build-status-column .status-item'));
      const titleEl = el.query(By.css('.status-title'));
      expect(titleEl.nativeElement.textContent).toEqual('passed');
    });
  }));
});

@Component({
  template: `<app-build-job-run-item [run]="run" [num]="num"></app-build-job-run-item>`
})
class TestRunningComponent {
  run: any;
  num: number;

  constructor() {
    const modifiedData = data;
    modifiedData.status = 'running';
    modifiedData.end_time = null;
    this.run = modifiedData;
    this.num = 1;
  }
}

describe('BuildJobRunItemComponent => Running Job', () => {
  let component: TestRunningComponent;
  let fixture: ComponentFixture<TestRunningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuildJobRunItemComponent, TestRunningComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRunningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have "Start Date" item displayed`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.queryAll(By.css('.job-run-item .date-column'))[0];
      const dateEl = el.query(By.css('.date'));
      expect(dateEl.nativeElement.textContent).not.toBe('');
    });
  }));

  it(`should have "Start Date" item displayed correctly`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.queryAll(By.css('.job-run-item .date-column'))[0];
      const dateEl = el.query(By.css('.date'));
      expect(dateEl.nativeElement.textContent.trim()).toEqual('Nov 20, 2018, 8:59:26 AM');
    });
  }));

  it(`should have "Finish Date" item value as "Running"`, async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.queryAll(By.css('.job-run-item .date-column'))[1];
      const dateEl = el.query(By.css('.date'));
      expect(dateEl.nativeElement.textContent.trim()).toEqual('Running');
    });
  }));

  it('should have running time calculated empty', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .time-column .time'));
      expect(el.nativeElement.textContent).toBe('');
    });
  }));

  it('should have "is-running" class enabled on status item', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .build-status-column .status-item'));
      expect(el.classes['is-running']).toBeDefined();
    });
  }));

  it('should have "running" status item displayed', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .build-status-column .status-item'));
      const titleEl = el.query(By.css('.status-title'));
      expect(titleEl.nativeElement.textContent).toEqual('running');
    });
  }));
});

@Component({
  template: `<app-build-job-run-item [run]="run" [num]="num"></app-build-job-run-item>`
})
class TestFailedComponent {
  run: any;
  num: number;

  constructor() {
    const modifiedData = data;
    modifiedData.status = 'failed';
    this.run = modifiedData;
    this.num = 1;
  }
}

describe('BuildJobRunItemComponent => Failed Job', () => {
  let component: TestFailedComponent;
  let fixture: ComponentFixture<TestFailedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuildJobRunItemComponent, TestFailedComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have "is-failed" class enabled on status item', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .build-status-column .status-item'));
      expect(el.classes['is-failed']).toBeDefined();
    });
  }));

  it('should have "failed" status item displayed', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .build-status-column .status-item'));
      const titleEl = el.query(By.css('.status-title'));
      expect(titleEl.nativeElement.textContent).toEqual('failed');
    });
  }));
});

@Component({
  template: `<app-build-job-run-item [run]="run" [num]="num"></app-build-job-run-item>`
})
class TestQueuedComponent {
  run: any;
  num: number;

  constructor() {
    const modifiedData = data;
    modifiedData.status = 'queued';
    modifiedData.end_time = null;
    this.run = modifiedData;
    this.num = 1;
  }
}

describe('BuildJobRunItemComponent => Queued Job', () => {
  let component: TestQueuedComponent;
  let fixture: ComponentFixture<TestQueuedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BuildJobRunItemComponent, TestQueuedComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestQueuedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have running time empty', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .time-column .time'));
      expect(el.nativeElement.textContent).toBe('');
    });
  }));

  it('should have "is-queued" class enabled on status item', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .build-status-column .status-item'));
      expect(el.classes['is-queued']).toBeDefined();
    });
  }));

  it('should have "queued" status item displayed', async(() => {
    fixture.whenStable().then(() => {
      const el = fixture.debugElement.query(By.css('.job-run-item .build-status-column .status-item'));
      const titleEl = el.query(By.css('.status-title'));
      expect(titleEl.nativeElement.textContent).toEqual('queued');
    });
  }));
});
