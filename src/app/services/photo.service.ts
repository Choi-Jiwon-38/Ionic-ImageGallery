import { Injectable } from '@angular/core';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { UserPhoto } from '../template/photo';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public dataExample: UserPhoto[] = [
    {
      filePath: '1',
      webviewPath: '../../assets/image/img1.jpg'
    },
    {
      filePath: '2',
      webviewPath: '../../assets/image/img2.jpg'
    },
    {
      filePath: '3',
      webviewPath: '../../assets/image/img3.jpg'
    },
    {
      filePath: '4',
      webviewPath: '../../assets/image/img4.jpg'
    },
    {
      filePath: '5',
      webviewPath: '../../assets/image/img5.jpg'
    },
  ];


  public data: UserPhoto[] = [];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private PHOTO_STORAGE: 'data';

  constructor() { }

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    this.dataExample.unshift({
      filePath: 'locall',
      webviewPath: capturedPhoto.webPath
    })
    // const savedImageFile = await this.savePicture(capturedPhoto);
    // this.data.unshift(savedImageFile);

    // Storage.set({
    //   key: this.PHOTO_STORAGE,
    //   value: JSON.stringify(this.data)
    // });
  }

  public async loadSaved() {
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE });
    this.data = JSON.parse(photoList.value) || [];

    for (const photo of this.data) {
      const readFile = await Filesystem.readFile({
        path: photo.filePath,
        directory: Directory.Data,
      });

      photo.webviewPath = 'data:image/jpeg;base64,${readFile.data}';
    }
  }

  private async savePicture(photo: Photo) {
    const base64Data =  await this.readAsBase64(photo);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filePath: fileName,
      webviewPath: photo.webPath
    };
  }

  private async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
