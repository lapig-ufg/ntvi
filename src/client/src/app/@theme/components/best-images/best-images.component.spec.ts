import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestImagesComponent } from './best-images.component';

describe('BestImagesComponent', () => {
  let component: BestImagesComponent;
  let fixture: ComponentFixture<BestImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestImagesComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
