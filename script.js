// Simple Task Manager Class
class SimpleTaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.setupEventListeners();
        this.render();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Add task button
        document.getElementById('addBtn').addEventListener('click', () => {
            this.addTask();
        });

        // Enter key to add task
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    // Generate unique ID for tasks
    generateId() {
        return Date.now().toString();
    }

    // Add new task
    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        // Check if input is empty
        if (!text) {
            alert('Please enter a task!');
            return;
        }

        // Create new task object
        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date()
        };

        // Add to beginning of tasks array
        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        
        // Clear input and focus
        input.value = '';
        input.focus();
    }

    // Toggle task completion status
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // Delete task
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    // Set filter for tasks
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
    }

    // Get filtered tasks based on current filter
    getFilteredTasks() {
        if (this.currentFilter === 'completed') {
            return this.tasks.filter(task => task.completed);
        } else if (this.currentFilter === 'pending') {
            return this.tasks.filter(task => !task.completed);
        }
        return this.tasks;
    }

    // Render tasks to the DOM
    render() {
        const taskList = document.getElementById('taskList');
        const emptyMessage = document.getElementById('emptyMessage');
        const filteredTasks = this.getFilteredTasks();

        // Show empty message or task list
        if (filteredTasks.length === 0) {
            let message = 'No tasks yet. Add one above! 👆';
            
            if (this.currentFilter === 'completed') {
                message = 'No completed tasks yet! 📋';
            } else if (this.currentFilter === 'pending') {
                message = 'No pending tasks! Great job! 🎉';
            }
            
            taskList.innerHTML = `<div class="empty-message">${message}</div>`;
        } else {
            taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        }

        this.updateStats();
    }

    // Create HTML for a single task
    createTaskHTML(task) {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="taskManager.toggleTask('${task.id}')">
                    ${task.completed ? '✓' : ''}
                </div>
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <button class="delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                    Delete
                </button>
            </div>
        `;
    }

    // Update statistics in header
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update DOM elements
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = progress + '%';
    }

    // Escape HTML to prevent XSS attacks
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem('simpleTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Could not save tasks:', error);
        }
    }

    // Load tasks from localStorage
    loadTasks() {
        try {
            const saved = localStorage.getItem('simpleTasks');
            if (saved) {
                const parsedTasks = JSON.parse(saved);
                // Convert date strings back to Date objects
                return parsedTasks.map(task => ({
                    ...task,
                    createdAt: new Date(task.createdAt)
                }));
            }
        } catch (error) {
            console.error('Could not load tasks:', error);
        }
        return [];
    }
}

// Initialize the app when page loads
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new SimpleTaskManager();
});