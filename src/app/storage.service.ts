import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, listAll, ref } from '@angular/fire/storage';
import { BehaviorSubject, Observable, from, map, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';
import { Avatar } from './avatar.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  currentUser$!: BehaviorSubject<User | null>;

  constructor(
    private readonly storage: Storage,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.getCurrentUser$();
  }

  getUserAvatar(): Observable<Avatar | null> {
    return this.currentUser$.pipe(
      switchMap((user) => {
        if (!user) {
          return of(null); // No user, return null avatar
        }

        const avatarImgPath = user.photoURL || null;
        if (!avatarImgPath) {
          return of(null); // User has no avatar, return null avatar
        }

        const avatarImgRef = ref(this.storage, avatarImgPath);
        return from(getDownloadURL(avatarImgRef)).pipe(
          map(
            (avatarImgUrl) =>
              ({
                path: avatarImgPath,
                url: avatarImgUrl,
              } as Avatar)
          )
        );
      })
    );
  }

  private getAllAvatars(): Observable<Avatar[]> {
    const folderPath = 'avatars';
    const folderRef = ref(this.storage, folderPath);

    return from(
      listAll(folderRef).then((result) => {
        const promises = result.items.map((itemRef) => {
          return getDownloadURL(itemRef).then((url) => {
            return {
              path: itemRef.fullPath,
              url: url,
            } as Avatar;
          });
        });

        return Promise.all(promises);
      })
    );
  }

  getAllAvatarsSorted(): Observable<Avatar[]> {
    const avatars$ = this.getAllAvatars();

    return avatars$.pipe(
      map((avatars) =>
        avatars.sort((avatar1, avatar2) => {
          const avatar1Index = parseInt(avatar1.path.split('/')[2]);
          const avatar2Index = parseInt(avatar2.path.split('/')[2]);

          return avatar1Index - avatar2Index;
        })
      )
    );
  }
}
