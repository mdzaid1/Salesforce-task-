// taskManager.js
import { LightningElement, track, wire } from 'lwc';
import getTasksForCurrentUser  from '@salesforce/apex/TaskManagerController.getTasksForCurrentUser ';
import createTask from '@salesforce/apex/TaskManagerController.createTask';
import updateTask from '@salesforce/apex/TaskManagerController.updateTask';

export default class TaskManager extends LightningElement {
    @track tasks = [];
    @track showModal = false;
    @track selectedTask;
    @track isLoading = true;

    columns = [
        { label: 'Subject', fieldName: 'Subject' },
        { label: 'Status', fieldName: 'Status' },
        { label: 'Priority', fieldName: 'Priority' },
        {
            type: 'action',
            typeAttributes: { rowActions: this.getRowActions }
        }
    ];

    @wire(getTasksForCurrentUser )
    wiredTasks({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.tasks = data;
        } else if (error) {
            console.error(error);
        }
    }

    getRowActions(row, doneCallback) {
        const actions = [];
        actions.push({ label: 'Edit', name: 'edit' });
        doneCallback(actions);
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'edit') {
            this.selectedTask = { ...row };
            this.showModal = true;
        }
    }

    handleNewTask() {
        this.selectedTask = {};
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
        this.selectedTask = undefined;
    }

    handleCreateTask(event) {
        const newTask = event.detail;
        createTask({ newTask })
            .then(result => {
                this.tasks = [...this.tasks, result];
                this.handleCloseModal();
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleTaskUpdated(event) {
        const updatedTask = event.detail;
        updateTask({ updatedTask })
            .then(result => {
                const index = this.tasks.findIndex(task => task.Id === result.Id);
                if (index !== -1) {
                    this.tasks[index] = result;
                }
                this.handleCloseModal();
            })
            .catch(error => {
                console.error(error);
            });
    }
}