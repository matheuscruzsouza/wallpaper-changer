import { TestBed } from '@angular/core/testing';

import { TrayMenuService } from './tray-menu.service';

describe('TrayMenuService', () => {
  let service: TrayMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrayMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
