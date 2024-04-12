import { Component } from '@angular/core';
import { finalize, forkJoin, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';
import { StorageService } from './storage.service';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user: User | null) => {
      if (user) {
        if (user.emailVerified) {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/verify-email']);
        }
      } else {
        this.router.navigate(['/sign-in']);
      }
    });

    this.storageService.allAvatarsSorted$
      .pipe(
        map((avatars) => avatars.map((avatar) => avatar.url)),
        tap((urls) => {
          const preloads = urls.map(
            (url) =>
              new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => reject();
                img.src = url;
              })
          );

          return forkJoin(preloads);
        }),
        finalize(() => {
          this.appService.setAvatarsLoading(false);
        })
      )
      .subscribe();
  }
}
