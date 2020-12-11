import { TestBed } from '@angular/core/testing';

import { UseClassService } from './use-class.service';

describe('UseClassService', () => {
  let service: UseClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
