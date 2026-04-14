import { TestBed } from '@angular/core/testing';

import { DashboardHelper } from './dashboard-helper';

describe('DashboardHelper', () => {
  let service: DashboardHelper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardHelper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
