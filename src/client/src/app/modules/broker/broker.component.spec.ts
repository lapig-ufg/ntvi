import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokerComponent } from './broker.component';

describe('BrokerComponent', () => {
  let component: BrokerComponent;
  let fixture: ComponentFixture<BrokerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokerComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
