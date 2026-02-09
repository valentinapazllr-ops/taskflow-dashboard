import { Task } from './task.js';

/**
 * Gestiona una colección de tareas.
 */
export class TaskManager {
    constructor() {
        this.tasks = [];
    }

    /**
     * Agrega una nueva tarea.
     */
    addTask(description, deadline = null) {
        const newTask = new Task(description, null, false, new Date(), deadline);
        this.tasks.push(newTask);
        return newTask;
    }

    /**
     * Elimina una tarea por su ID.
     */
    removeTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    /**
     * Busca una tarea por su ID.
     */
    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    /**
     * Devuelve todas las tareas.
     */
    getTasks() {
        return this.tasks;
    }

    /**
     * Carga tareas desde un array de objetos.
     */
    loadTasks(data) {
        this.tasks = data.map(t => new Task(
            t.description || t.title,
            t.id,
            t.completed,
            t.createdAt || new Date(),
            t.deadline
        ));
    }
}
