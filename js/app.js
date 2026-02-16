import { TaskManager } from './taskmanager.js';

const taskManager = new TaskManager();

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDeadline = document.getElementById('task-deadline');
const taskList = document.getElementById('task-list');
const deletedTaskList = document.getElementById('deleted-task-list');
const totalCount = document.getElementById('total-count');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const deletedCount = document.getElementById('deleted-count');
const syncBtn = document.getElementById('sync-api');
const themeToggle = document.getElementById('theme-toggle');
const notificationContainer = document.getElementById('notification-container');

/**
 * Muestra una notificación temporal.
 */
const showNotification = (message, type = 'primary') => {
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.innerHTML = `<span>${message}</span>`;
    notificationContainer.appendChild(div);

    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translateX(50px)';
        setTimeout(() => div.remove(), 500);
    }, 4000);
};

/**
 * Renderiza la lista de tareas.
 */
const renderTasks = () => {
    // Render Active Tasks
    renderTaskList(taskManager.getActiveTasks(), taskList, false);
    // Render Deleted Tasks
    renderTaskList(taskManager.getDeletedTasks(), deletedTaskList, true);

    updateStats();
};

/**
 * Renderiza una lista específica de tareas.
 */
const renderTaskList = (tasks, container, isDeleted) => {
    container.innerHTML = '';

    if (tasks.length === 0) {
        if (!isDeleted) {
            container.innerHTML = `
                <li class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Tu lista está vacía</p>
                    <small>Agrega una tarea para comenzar a organizarte</small>
                </li>`;
        } else {
            document.getElementById('deleted-section').style.display = 'none';
        }
        return;
    }

    if (isDeleted) {
        document.getElementById('deleted-section').style.display = 'block';
    }

    // Sort tasks: pending first, then by deadline
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    sortedTasks.forEach(task => {
        const { id, description, completed, deadline } = task;
        const li = document.createElement('li');
        li.className = `task-item ${completed ? 'completed' : ''}`;
        li.dataset.id = id;

        const timeRemaining = task.getTimeRemaining();
        let countdownHTML = '';
        if (timeRemaining && !completed && !isDeleted) {
            if (timeRemaining.expired) {
                countdownHTML = '<span class="countdown">⚠️ Expirada</span>';
            } else {
                const isNear = timeRemaining.days === 0;
                countdownHTML = `<span class="countdown ${isNear ? '' : 'active'}">
                    <i class="far fa-clock"></i> ${timeRemaining.days}d ${timeRemaining.hours}h
                </span>`;
            }
        }

        if (!isDeleted) {
            li.innerHTML = `
                <input type="checkbox" ${completed ? 'checked' : ''} class="toggle-task" aria-label="Marcar como completada">
                <span class="description">${description}</span>
                <div class="task-info">
                    ${deadline ? `<span><i class="far fa-calendar-alt"></i> ${new Date(deadline).toLocaleDateString()}</span>` : ''}
                    ${countdownHTML}
                </div>
                <button class="delete-btn" title="Mover a la papelera" aria-label="Mover a la papelera">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
        } else {
            li.innerHTML = `
                <span class="description">${description}</span>
                <div class="actions-container">
                    <button class="restore-btn" title="Restaurar tarea" aria-label="Restaurar tarea">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="permanent-delete-btn" title="Eliminar permanentemente" aria-label="Eliminar permanentemente">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>
            `;
        }

        container.appendChild(li);
    });
};

const updateStats = () => {
    const allTasks = taskManager.getTasks();
    const activeTasks = taskManager.getActiveTasks();
    const deletedTasks = taskManager.getDeletedTasks();

    totalCount.textContent = activeTasks.length;
    pendingCount.textContent = activeTasks.filter(t => !t.completed).length;
    completedCount.textContent = activeTasks.filter(t => t.completed).length;
    deletedCount.textContent = deletedTasks.length;
};

const handleAddTask = async (e) => {
    e.preventDefault();
    const description = taskInput.value.trim();
    const deadline = taskDeadline.value;

    if (!description) return;

    const addBtn = document.getElementById('add-task-btn');
    const originalText = addBtn.innerHTML;

    taskInput.disabled = true;
    addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';

    setTimeout(() => {
        taskManager.addTask(description, deadline);
        saveTasks();
        renderTasks();

        taskInput.value = '';
        taskDeadline.value = '';
        taskInput.disabled = false;
        addBtn.innerHTML = originalText;

        showNotification(`"${description}" agregada`);
    }, 800);
};

const fetchInitialTasks = async () => {
    const originalContent = syncBtn.innerHTML;
    try {
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        syncBtn.disabled = true;

        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
        if (!response.ok) throw new Error('Error al conectar con la API');
        const data = await response.json();

        taskManager.loadTasks(data);
        saveTasks();
        renderTasks();
        showNotification('Sincronizado con éxito');
    } catch (error) {
        showNotification('Error al sincronizar con la API', 'danger');
    } finally {
        syncBtn.innerHTML = originalContent;
        syncBtn.disabled = false;
    }
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('taskflow_theme', newTheme);

    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
};

const saveTasks = () => {
    const data = taskManager.getTasks().map(t => t.toJSON());
    localStorage.setItem('taskflow_data', JSON.stringify(data));
};

const loadInitialState = () => {
    // Load Theme
    const savedTheme = localStorage.getItem('taskflow_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    // Load Tasks
    const savedTasks = localStorage.getItem('taskflow_data');
    if (savedTasks) {
        taskManager.loadTasks(JSON.parse(savedTasks));
        renderTasks();
    }
};

// --- Event Listeners ---
taskForm.addEventListener('submit', handleAddTask);
themeToggle.addEventListener('click', toggleTheme);
syncBtn.addEventListener('click', fetchInitialTasks);

taskList.addEventListener('click', (e) => {
    const item = e.target.closest('.task-item');
    if (!item) return;

    const id = item.dataset.id;

    if (e.target.closest('.delete-btn')) {
        taskManager.removeTask(id);
        saveTasks();
        renderTasks();
        showNotification('Tarea movida a la papelera');
    } else if (e.target.classList.contains('toggle-task')) {
        const task = taskManager.getTask(id);
        task.toggleStatus();
        saveTasks();
        renderTasks();
    }
});

deletedTaskList.addEventListener('click', (e) => {
    const item = e.target.closest('.task-item');
    if (!item) return;

    const id = item.dataset.id;

    if (e.target.closest('.restore-btn')) {
        taskManager.restoreTask(id);
        saveTasks();
        renderTasks();
        showNotification('Tarea restaurada');
    } else if (e.target.closest('.permanent-delete-btn')) {
        if (confirm('¿Estás seguro de eliminar esta tarea permanentemente?')) {
            taskManager.permanentlyDeleteTask(id);
            saveTasks();
            renderTasks();
            showNotification('Tarea eliminada definitivamente', 'danger');
        }
    }
});

// Update countdowns every minute
setInterval(renderTasks, 60000);

// Initialize
loadInitialState();
