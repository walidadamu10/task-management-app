import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../task.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss']
})
export class EditTaskComponent implements OnInit {
  TaskListsId: string | null = null;
  TasksId: string | null = null;
  newTaskTitle = ''; // Ensure newTaskTitle is initialized to an empty string

  constructor(private route: ActivatedRoute, private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      // Check if TaskListsId is a valid ObjectId
      if (this.isValidObjectId(params['TaskListsId'])) {
        this.TaskListsId = params['TaskListsId'];
      } else {
        console.error('Invalid TaskListsId');
        // Handle the error, such as redirecting to an error page
        return;
      }
      // Check if TasksId is a valid ObjectId
      if (this.isValidObjectId(params['tasksId'])) {
        this.TasksId = params['tasksId'];
      } else {
        console.error('Invalid TasksId');
        // Handle the error, such as redirecting to an error page
        return;
      }
    });
  }

  updateTask(): void {
    if (!this.TaskListsId || !this.TasksId) {
      console.error('TaskListsId or TasksId is undefined');
      return;
    }

    if (!this.newTaskTitle) {
      console.error('New task title is empty');
      return;
    }

    this.taskService.updateTask(this.TaskListsId, this.TasksId, this.newTaskTitle).subscribe(
      () => {
        console.log('Task updated successfully');
        this.newTaskTitle = ''; // Clear the input field after updating
        this.router.navigate(['/TaskLists', this.TaskListsId]);
      },
      error => {
        console.error('Error updating task:', error);
      }
    );
    
  }

  // Function to validate ObjectId format
  isValidObjectId(id: string): boolean {
    const checkForValidObjectId = new RegExp('^[0-9a-fA-F]{24}$');
    return checkForValidObjectId.test(id);
  }
}
