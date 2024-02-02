import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedListPanelComponent } from './selected-list-panel.component';

describe('SelectedListPanelComponent', () => {
  let component: SelectedListPanelComponent;
  let fixture: ComponentFixture<SelectedListPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectedListPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectedListPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
