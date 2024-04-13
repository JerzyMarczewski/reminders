import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReenterCredentialsDialogComponent } from './reenter-credentials-dialog.component';

describe('ReenterCredentialsDialogComponent', () => {
  let component: ReenterCredentialsDialogComponent;
  let fixture: ComponentFixture<ReenterCredentialsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReenterCredentialsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReenterCredentialsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
