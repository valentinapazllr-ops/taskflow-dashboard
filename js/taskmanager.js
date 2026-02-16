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
     * Mueve una tarea a la papelera (marcado lógico).
     */
    removeTask(id) {
        const task = this.getTask(id);
        if (task) task.deleted = true;
    }

    /**
     * Restaura una tarea de la papelera.
     */
    restoreTask(id) {
        const task = this.getTask(id);
        if (task) task.deleted = false;
    }

    /**
     * Elimina físicamente una tarea.
     */
    permanentlyDeleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    /**
     * Busca una tarea por su ID.
     */
    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    /**
     * Devuelve todas las tareas (incluyendo eliminadas).
     */
    getTasks() {
        return this.tasks;
    }

    /**
     * Devuelve solo tareas activas.
     */
    getActiveTasks() {
        return this.tasks.filter(t => !t.deleted);
    }

    /**
     * Devuelve tareas en la papelera.
     */
    getDeletedTasks() {
        return this.tasks.filter(t => t.deleted);
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
            t.deadline,
            t.deleted || false
        ));
    }
}
