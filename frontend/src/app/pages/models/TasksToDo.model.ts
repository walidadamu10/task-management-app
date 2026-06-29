export class Task {
    _id: string;
    _TaskListsId: string;
    title: string;
    completed: boolean;
    
    constructor() {
        this._id = '';
        this._TaskListsId = '';
        this.title = '';
        this.completed = false;
    }
}