import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { TaskLists } from './pages/models/TaskLists.model';
import { Task } from './pages/models/TasksToDo.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  addList (title: string) {
    //send a web request to create a task list
    return this.webReqService.post('TaskLists', { title });
  }

  updateList (title: string, id: string) {
    //send a web request to update a task list
    return this.webReqService.patch(`TaskLists/${id}`, { title });
  }

  updateTask(TaskListsId: string, tasksId: string, title: string) {
    //send a web request to update a task
    return this.webReqService.patch(`TaskLists/${TaskListsId}/tasks/${tasksId}`, { title });
  }
  
  deleteList (TaskListsId: string) {
    return this.webReqService.delete(`TaskLists/${TaskListsId}`);
  }

  deleteTask (TaskListsId: string, tasksId: string) {
    return this.webReqService.delete(`TaskLists/${TaskListsId}/tasks/${tasksId}`);
  }

  getLists() {
    return this.webReqService.get('TaskLists')
  }

  getTasks(TaskListsId: string) {
    return this.webReqService.get(`TaskLists/${TaskListsId}/tasks`);
  }

  addTask(title: string, TaskListsId: string) {
    // Send a web request to add a task
    return this.webReqService.post(`TaskLists/${TaskListsId}/tasks`, { title });
}

  complete(task: Task) {
    return this.webReqService.patch(`TaskLists/${task._TaskListsId}/tasks/${task._id} `, {
      completed: !task.completed
    })
  }

















}
