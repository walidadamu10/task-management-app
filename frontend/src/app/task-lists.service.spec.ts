import { TestBed } from '@angular/core/testing';

import { TaskListsService } from './task-lists.service';

describe('TaskListsService', () => {
  let service: TaskListsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskListsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
