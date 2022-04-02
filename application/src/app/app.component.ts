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
  selectedImage: any;

  constructor(private trayMenu: TrayMenuService, private wallpaperChangerService: WallpaperChangerService) {
    const PATH = "/home/matheus/Pictures/Favorites";

    this.wallpaperChangerService.loadFolder(PATH);

    this.wallpaperChangerService.selectedImage.subscribe((data: any) => {this.setSelectedImage(data)});
  }

  async setSelectedImage(image: any) {
    this.selectedImage = image;
    this.selectedImage.original = await this.wallpaperChangerService.loadImage(image.path, 0);
  }

  horizontalScroll(event: any) {
    if (this.selectedImage) {
      event.preventDefault();

      event.target.parentNode.scrollBy({
        left: event.deltaY < 0 ? -30 : 30,
      });
    }
  }

}
