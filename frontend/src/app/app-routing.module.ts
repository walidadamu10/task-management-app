import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { AddListComponent } from './pages/add-list/add-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { EditListComponent } from './pages/edit-list/edit-list.component';
import { EditTaskComponent } from './pages/edit-task/edit-task.component';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'add-list', component: AddListComponent},
  { path: 'edit-list/:TaskListsId', component: EditListComponent},
  { path: 'login', component: LoginPageComponent},
  { path: 'signup', component: SignupPageComponent },
  { path: 'TaskLists', component: TaskViewComponent},
  { path: 'TaskLists/:TaskListsId/new-task', component: NewTaskComponent},
  { path: 'TaskLists/:TaskListsId/edit-task/:tasksId', component: EditTaskComponent },
  { path: 'TaskLists/:TaskListsId', component: TaskViewComponent},
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
