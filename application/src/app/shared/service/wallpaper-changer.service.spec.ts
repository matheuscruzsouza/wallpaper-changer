import { TestBed } from '@angular/core/testing';

import { WallpaperChangerService } from './wallpaper-changer.service';

describe('WallpaperChangerService', () => {
  let service: WallpaperChangerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WallpaperChangerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
