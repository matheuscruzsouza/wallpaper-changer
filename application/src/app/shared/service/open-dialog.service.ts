import { Injectable } from "@angular/core";

declare const Neutralino: any;

@Injectable({
  providedIn: 'root'
})
export class OpenDialogService {

  async openFolder(callback: Function) {
    console.log(Neutralino);

    Neutralino.extensions.dispatch('js.neutralino.filesaver', 'openFolder', null);
    await Neutralino.events.on('openFolder', callback);
  }

}
