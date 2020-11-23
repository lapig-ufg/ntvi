import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampRegisterComponent } from './camp-register.component';

describe('CampaignComponent', () => {
  let component: CampRegisterComponent;
  let fixture: ComponentFixture<CampRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampRegisterComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
