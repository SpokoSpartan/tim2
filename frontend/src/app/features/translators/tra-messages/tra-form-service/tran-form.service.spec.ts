import { TestBed } from '@angular/core/testing';

import { TranFormService } from './tran-form.service';

describe('TranFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TranFormService = TestBed.get(TranFormService);
    expect(service).toBeTruthy();
  });
});
