import { Component } from '@angular/core';
import { TrayMenuService } from './shared/service/tray-menu.service';
import { WallpaperChangerService } from './shared/service/wallpaper-changer.service';

declare const NL_VERSION: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'application';

  NL_VERSION = NL_VERSION;

  constructor(private trayMenu: TrayMenuService, private wallpaperChangerService: WallpaperChangerService) {
    const PATH = "/home/matheus/Pictures/Favorites";

    this.wallpaperChangerService.loadFolder(PATH);
  }

}
