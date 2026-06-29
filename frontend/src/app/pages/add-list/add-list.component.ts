import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { Router } from '@angular/router';
import { TaskLists } from '../models/TaskLists.model';

@Component({
  selector: 'app-add-list',
  templateUrl: './add-list.component.html',
  styleUrls: ['./add-list.component.scss']
})
export class AddListComponent implements OnInit {

  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit() {
  }

  addList(title: string) {
    this.taskService.addList(title).subscribe((response: any) => {
      const taskList: TaskLists = response; // Cast response to TaskLists
      console.log(taskList);
      if (taskList && taskList._id) {
        this.router.navigate(['/TaskLists', taskList._id]);
      }
    });
  }

}
