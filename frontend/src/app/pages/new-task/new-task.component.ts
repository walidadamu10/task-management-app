import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from '../models/TasksToDo.model'; // Assuming this is the correct import path

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss'] // Corrected the typo in styleUrls
})
export class NewTaskComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) {}

  TaskListsId: string = '';

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.TaskListsId = params['TaskListsId']; 
    });
  }
  
     
  addTask(title: string) {
    this.taskService.addTask(title, this.TaskListsId).subscribe((newTask: any) => {
      console.log(newTask);
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
  
}
