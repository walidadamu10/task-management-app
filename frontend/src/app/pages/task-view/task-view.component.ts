import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from '../models/TasksToDo.model';
import { TaskLists } from '../models/TaskLists.model';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrl: './task-view.component.scss'
})
export class TaskViewComponent implements OnInit {

  TaskLists!: TaskLists[];
  Tasks!: Task[];

  selectedListId! : string;



  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        if (params['TaskListsId']) {
          this.selectedListId = params['TaskListsId']
          this.taskService.getTasks(params['TaskListsId']).subscribe((Tasks: any) => {
            this.Tasks = Tasks;
          })
        } else {
          this.Tasks = undefined!
        }
      }
    );
  
    this.taskService.getLists().subscribe((TaskLists: any) => {
      this.TaskLists = TaskLists
    });
  }

  onTaskClick (task: Task) {
    //we want to set this to complete
    this.taskService.complete(task).subscribe(() => {
      console.log("Completed successfully");
      task.completed = !task.completed;
    })

  }

  DeleteListClick () {
    this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
      this.router.navigate(['/TaskLists'])
      console.log(res);
    })    
  }

  DeleteTaskClick (id: string) {
    this.taskService.deleteTask(this.selectedListId, id).subscribe((res: any) => {   
      this.Tasks = this.Tasks.filter(val => val._id !== id); 
      console.log(res);
    })
      
    }
}









