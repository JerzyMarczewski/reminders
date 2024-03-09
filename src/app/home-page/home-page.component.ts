import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  avatarsLoading$!: Observable<boolean>;
  userImageLoading$!: Observable<boolean>;

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.avatarsLoading$ = this.appService.avatarsLoading$;
    this.userImageLoading$ = this.appService.userImageLoading$;
  }
}
