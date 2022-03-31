import { EventEmitter, Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

declare const Neutralino: any;

@Injectable({
  providedIn: 'root'
})
export class WallpaperChangerService {

  public nextWallpaper = new EventEmitter(false);
  public previousWallpaper = new EventEmitter(false);

  private wallpapers: any[] = [];
  private currentWallpaper = 0

  private images: any[] = [];
  private reader = new FileReader();
  private loader = new EventEmitter();
  private wasCalled = false;

  constructor(private notificationService: NotificationService) {}

  loadFolder(PATH: string) {

    this.nextWallpaper.subscribe(() => this.setRandomWallpaper());

    this.previousWallpaper.subscribe(() => this.setRandomWallpaper(-1));

    setTimeout(() => {
      this.notificationService.showNotification("wallpaper changer", "The wallpaper will change at every 60 secs.");

      let i = 0;

      Neutralino.filesystem.readDirectory(PATH).then((entries: any[]) => {
        entries
          .filter((item: any) => item.entry.length > 2)
          .forEach((item, index) => this.images.push({
            path: PATH + "/" + item.entry,
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

    }, 1 * 1000);
  }

  async imagePreview(array: any[], index: number) {
    const path = array[index].path;
    const wrapper = document.getElementById('images');

    try {
      let data = await Neutralino.storage.getData(path.split('/').reverse()[0].split('.')[0]);

      if (data) {
        const image = document.createElement('img');
        image.onload = () => wrapper?.appendChild(image);
        image.onclick = () => this.setAsWallpaper(path);
        image.src = data;

        console.log("LOADED BY STORAGE");

        this.loader.emit(index + 1);

        return;
      }

    } catch (error) {
      let data = await Neutralino.filesystem.readBinaryFile(path, { background: true });

      console.log("NOT LOADED BY STORAGE");

      if (data) {
        let blob = new Blob([new Uint8Array(data)], {'type': `image/${path.split('.')[1]}`});
        this.reader = new FileReader();
        this.reader.onloadend = () => {
          if (typeof this.reader.result == 'string') {
            let _image = new Image();
            _image.onload = (event) => this.resizeMe(event.target, wrapper, path, index);
            _image.src = this.reader.result;
          }
        };
        this.reader.readAsDataURL(blob);
      }
    }

  }

  resizeMe(_image: any, wrapper: any, path: string, index: number) {
    const canvas = document.createElement('canvas');
    let max_size = 200, width = _image.width, height = _image.height;
    if (width > height) {
        if (width > max_size) {
            height *= max_size / width;
            width = max_size;
        }
    } else {
        if (height > max_size) {
            width *= max_size / height;
            height = max_size;
        }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(_image, 0, 0, width, height);
      const image = document.createElement('img');
      image.onload = () => wrapper?.appendChild(image);
      image.onclick = () => this.setAsWallpaper(path);
      const dataURL = canvas.toDataURL('image/jpeg', 0.5);
      image.src = dataURL;
      Neutralino.storage.setData(path.split('/').reverse()[0].split('.')[0], dataURL);

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
