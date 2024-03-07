import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, listAll, ref } from '@angular/fire/storage';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';
import { Avatar } from './avatar.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private currentUser$!: BehaviorSubject<User | null>;
  private allAvatars$!: Observable<Avatar[]>;
  allAvatarsSorted$!: Observable<Avatar[]>;
  userAvatar$!: Observable<Avatar | null>;

  constructor(
    private readonly storage: Storage,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.allAvatars$ = this.getAllAvatars();
    this.allAvatarsSorted$ = this.allAvatars$.pipe(
      map((avatars) => this.sortAvatarsById(avatars))
    );

    this.userAvatar$ = combineLatest([
      this.authService.currentUser$,
      this.allAvatars$,
    ]).pipe(
      map(([currentUser, allAvatars]) => {
        if (!currentUser || !currentUser.photoURL || !allAvatars) {
          return null;
        }
        return (
          allAvatars.find((avatar) => avatar.path === currentUser.photoURL) ||
          null
        );
      })
    );
  }

  getUserAvatar(): Observable<Avatar | null> {
    return this.currentUser$.pipe(
      switchMap((user) => {
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

  private extractIdFromAvatarPath(path: string): number | null {
    try {
      const idStr = path.split('/')[1].slice(0, -4);
      const id = parseInt(idStr);
      if (isNaN(id)) {
        throw new Error('Invalid ID');
      }
      return id;
    } catch (error) {
      console.error('Error extracting ID from avatar path:', error);
      return null;
    }
  }

  private sortAvatarsById(avatars: Avatar[]) {
    return avatars.sort((avatar1, avatar2) => {
      const avatar1id = this.extractIdFromAvatarPath(avatar1.path);
      const avatar2id = this.extractIdFromAvatarPath(avatar2.path);

      if (avatar1id === null && avatar2id === null) {
        return 0;
      } else if (avatar1id === null) {
        return 1;
      } else if (avatar2id === null) {
        return -1;
      } else {
        return avatar1id - avatar2id;
      }
    });
  }
}
