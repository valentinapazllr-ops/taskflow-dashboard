/**
 * Representa una tarea individual en la aplicación TaskFlow.
 * Utiliza principios de POO y ES6+.
 */
export class Task {
    /**
     * @param {string} description - Descripción de la tarea.
     * @param {string|null} id - ID único (opcional).
     * @param {boolean} completed - Estado de la tarea.
     * @param {Date|string} createdAt - Fecha de creación.
     * @param {string|null} deadline - Fecha límite (YYYY-MM-DD).
     */
    constructor(description, id = null, completed = false, createdAt = new Date(), deadline = null) {
        this.id = id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.description = description;
        this.completed = completed;
        this.createdAt = new Date(createdAt);
        this.deadline = deadline ? new Date(deadline) : null;
    }

    /**
     * Cambia el estado de completado de la tarea.
     */
    toggleStatus() {
        this.completed = !this.completed;
    }

    /**
     * Calcula el tiempo restante para la fecha límite.
     * @returns {object|null} - { days, hours, minutes } o null.
     */
    getTimeRemaining() {
        if (!this.deadline || this.completed) return null;

        const now = new Date();
        const diff = this.deadline.getTime() - now.getTime();

        if (diff <= 0) return { expired: true };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);

        return { expired: false, days, hours, minutes };
    }

    /**
     * Convierte la instancia a un objeto plano para almacenamiento.
     */
    toJSON() {
        return {
            id: this.id,
            description: this.description,
            completed: this.completed,
            createdAt: this.createdAt.toISOString(),
            deadline: this.deadline ? this.deadline.toISOString().split('T')[0] : null
        };
    }
}
