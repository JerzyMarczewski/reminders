import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReminderDialogComponent } from './edit-reminder-dialog.component';

describe('EditReminderDialogComponent', () => {
  let component: EditReminderDialogComponent;
  let fixture: ComponentFixture<EditReminderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditReminderDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditReminderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
