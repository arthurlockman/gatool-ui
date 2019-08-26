import {TestBed} from '@angular/core/testing';

import {GatoolBackendService} from './gatool-backend.service';

describe('GatoolBackendService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GatoolBackendService = TestBed.get(GatoolBackendService);
    expect(service).toBeTruthy();
  });
});
