import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { TaskListsService } from '../../task-lists.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss']
})
export class EditListComponent implements OnInit {
  listId!: string;
  newListTitle!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inject Router
    private taskListService: TaskListsService
  ) {}

  ngOnInit(): void {
    // Get the list ID from the route parameter
    this.listId = this.route.snapshot.paramMap.get('TaskListsId')!;
  }

  updateList(): void {
    if (!this.listId) {
      console.error('List ID is undefined');
      return;
    }

    // Call the service method to update the list
    this.taskListService.updateList(this.listId, { title: this.newListTitle }).subscribe(
      () => {
        console.log('List updated successfully');
        // Navigate back to main tasklists page upon successful update
        this.router.navigate(['/TaskLists']);
      },
      error => {
        console.error('Error updating list:', error);
        // Handle error appropriately
      }
    );
  }
}
