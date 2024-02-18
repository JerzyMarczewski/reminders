import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, listAll, ref } from '@angular/fire/storage';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private readonly storage: Storage,
    private authService: AuthService
  ) {}

  getUserAvatar() {
    return this.authService.user$.pipe(
      map((user) => {
        if (!user) return of(null);

        const avatarImgPath = user?.photoURL || null;
        if (!avatarImgPath) return of(null);

        const avatarImgRef = ref(this.storage, avatarImgPath);
        const avatarImgUrl = getDownloadURL(avatarImgRef);

        return from(avatarImgUrl);
      }),
      switchMap((avatarImgUrl$) => avatarImgUrl$)
    );
  }

  getAllAvatars() {
    const folderPath = 'avatars';
    const folderRef = ref(this.storage, folderPath);

    const avatarsData: { path: string; url: string }[] = [];

    listAll(folderRef).then((result) => {
      result.items.forEach((itemRef) => {
        getDownloadURL(itemRef).then((url) => {
          avatarsData.push({
            path: itemRef.fullPath,
            url: url,
          });
        });
      });
    });

    return avatarsData;
  }
}
