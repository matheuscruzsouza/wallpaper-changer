import { EventEmitter, Injectable, Output } from '@angular/core';
import { NotificationService } from './notification.service';

declare const Neutralino: any;
declare const NL_PATH: string;

@Injectable({
  providedIn: 'root'
})
export class WallpaperChangerService {

  public nextWallpaper = new EventEmitter(false);
  public previousWallpaper = new EventEmitter(false);
  @Output("selectedImage") selectedImage = new EventEmitter();

  private wallpapers: any[] = [];
  private currentWallpaper = 0

  private images: any[] = [];
  private loader = new EventEmitter();
  private wasCalled = false;

  constructor(private notificationService: NotificationService) {}

  loadFolder(PATH: string) {

    this.nextWallpaper.subscribe(() => this.setRandomWallpaper());

    this.previousWallpaper.subscribe(() => this.setRandomWallpaper(-1));

    setTimeout(() => {
      this.notificationService.showNotification("wallpaper changer", "The wallpaper will change at every 60 secs.");

      this.readAllImages(PATH);
    }, 1000);

  }

  readAllImages(path: string) {
    Neutralino.filesystem.readDirectory(path).then((entries: any[]) => {
      entries
        .filter((item: any) => item.entry.length > 2)
        .forEach((item, index) => this.images.push({
          path: path + "/" + item.entry,
          name: item.entry,
          index,
        }));

      this.imagePreview(this.images, 0);

      this.wallpapers = [...this.images];
      this.wallpapers.sort(() => 0.5 - Math.random());
    });

    this.loader.subscribe((next: number) => {
      this.imagePreview(this.images, next);
    });

    this.autoChangeWallpaper();
  }

  async imagePreview(array: any[], index: number) {
    const path = array[index].path;
    const object = array[index];

    const folderName = path.split('/').reverse()[1];
    const imageName = path.split('/').reverse()[0].split('.')[0];

    try {
      let data = await Neutralino.storage.getData(folderName + "_" + imageName);

      if (data) {
        console.log("LOADED BY STORAGE");

        this.createImage(data, object);

        this.callNext(index);

        return;
      }

    } catch (error) {

      console.log("NOT LOADED BY STORAGE");

      const dataURL = await this.loadImage(path);

      if (dataURL) {
        this.createImage(dataURL, object);

        Neutralino.storage.setData(folderName + "_" + imageName, dataURL);
      }

      this.callNext(index);
    }

  }

  createImage(data: string, object: any): HTMLImageElement {
    const wrapper = document.getElementById('images');
    const image = document.createElement('img');

    // Add preview image to object
    object.preview = data;

    // Add preview to screen
    image.onload = () => {
      wrapper?.appendChild(image);
    };

    // Select image
    image.onclick = () => {
      this.selectedImage.emit(object);
    };

    image.src = data;

    return image;
  }

  async loadImage(path: string, quality: number = 200) {
    return Neutralino.os.execCommand(NL_PATH + `/resize ${path} ${quality}`, { background: true });
  }

  callNext(index: number) {
    if (index + 1 < this.images.length) {
      this.loader.emit(index + 1);
    }
  }

  setRandomWallpaper(direction: number = 1) {
    if (!this.wasCalled) {
      this.wasCalled = true;

      this.currentWallpaper += direction
      const index = Math.floor((this.wallpapers.length + this.currentWallpaper) % this.wallpapers.length);
      console.log(this.currentWallpaper, index, this.wallpapers[index]);

      this.setAsWallpaper(this.wallpapers[index].path);

      setTimeout(() => { this.wasCalled = false; }, 1000);
    }
  }

  autoChangeWallpaper() {
    setInterval(() => {
      this.setRandomWallpaper();
    }, 60 * 1000);
  }

  async setAsWallpaper(path: string) {
    await Neutralino.os.execCommand(`gsettings set org.gnome.desktop.background picture-uri "${path}"`, { background: true });
  }
}
