import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskListsService {

  private baseUrl = 'http://localhost:3000/TaskLists';

  constructor(private http: HttpClient) { }

  // Define the updateList method
  updateList(listId: string, updatedList: { title: string }): Observable<any> {
    const url = `${this.baseUrl}/${listId}`;
    return this.http.patch(url, updatedList);
  }
}
