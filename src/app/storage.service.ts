import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, listAll, ref } from '@angular/fire/storage';
import { Observable, from, map, of, shareReplay, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

export interface Avatar {
  path: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private readonly storage: Storage,
    private authService: AuthService
  ) {}

  getUserAvatar(): Observable<Avatar | null> {
    return this.authService.user$.pipe(
      switchMap((user: User | null) => {
        if (!user) {
          return of(null);
        }

        const avatarImgPath = user.photoURL || null;
        if (!avatarImgPath) {
          return of(null);
        }

        const avatarImgRef = ref(this.storage, avatarImgPath);
        return from(getDownloadURL(avatarImgRef)).pipe(
          map(
            (avatarImgUrl: string) =>
              ({
                path: avatarImgPath,
                url: avatarImgUrl,
              } as Avatar)
          )
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getAllAvatars(): Promise<Avatar[]> {
    return new Promise<Avatar[]>((resolve, reject) => {
      const folderPath = 'avatars';
      const folderRef = ref(this.storage, folderPath);
      const avatarsData: { path: string; url: string }[] = [];

      listAll(folderRef)
        .then((result) => {
          const promises = result.items.map((itemRef) => {
            return getDownloadURL(itemRef).then((url) => {
              avatarsData.push({
                path: itemRef.fullPath,
                url: url,
              });
            });
          });

          return Promise.all(promises);
        })
        .then(() => {
          resolve(avatarsData);
        })
        .catch((error) => {
          console.error('Error while fetching avatars', error);
          reject(error);
        });
    });
  }
}
