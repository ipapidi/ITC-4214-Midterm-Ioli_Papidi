$(document).ready(function() {
    // =================================================================
    // APPLICATION STATE (The single source of truth)
    // =================================================================
    let tasks = [];
    let currentFilter = 'all';
    let currentSort = 'none';

    // =================================================================
    // DOM ELEMENTS CACHE
    // =================================================================
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    const taskForm = $('#taskForm');
    const taskList = $('.task-list');

    // =================================================================
    // CORE LOGIC (Manipulate state, then call render)
    // =================================================================

    /**
     * The single, master function to render the UI from the state.
     */
    const render = () => {
        let tasksToRender = [...tasks];

        // 1. FILTERING
        if (currentFilter !== 'all') {
            tasksToRender = tasksToRender.filter(task => 
                task.priority === currentFilter || task.status === currentFilter
            );
        }

        // 2. SORTING
        if (currentSort !== 'none') {
            tasksToRender.sort((a, b) => {
                if (currentSort === 'priority') {
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                }
                if (currentSort === 'status') {
                    const statusOrder = { 'todo': 3, 'in-progress': 2, 'completed': 1 };
                    return statusOrder[b.status] - statusOrder[a.status];
                }
                return 0;
            });
        }

        // 3. RENDER TO DOM
        taskList.empty();
        if (tasksToRender.length === 0) {
            taskList.html('<p class="text-center text-muted mt-4">No tasks match the current view.</p>');
        } else {
            tasksToRender.forEach(task => taskList.append(getTaskHtml(task)));
        }
    };

    /**
     * Saves the entire `tasks` array to localStorage.
     */
    const save = () => {
        localStorage.setItem('tasque_tasks', JSON.stringify(tasks));
    };

    /**
     * Loads tasks from localStorage or initializes the app from HTML templates.
     */
    const load = () => {
        const storedTasks = localStorage.getItem('tasque_tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        } else {
            // First time load: parse the HTML templates to create the initial state.
            tasks = [];
            $('.task-item-initial').each(function() {
                const taskEl = $(this);
                tasks.push({
                    id: `task_${Date.now()}_${tasks.length}`,
                    title: taskEl.find('.task-title').text(),
                    description: taskEl.find('.task-description').text(),
                    priority: taskEl.data('priority'),
                    status: taskEl.data('status'),
                });
            });
            save();
        }
        render();
    };

    // =================================================================
    // EVENT HANDLERS (Only update state, then call save and render)
    // =================================================================

    // --- View Options (Filter & Sort) ---
    $('.filter-option').on('click', function(e) {
        e.preventDefault();
        currentFilter = $(this).data('filter');
        render();
    });

    $('.sort-option').on('click', function(e) {
        e.preventDefault();
        currentSort = $(this).data('sort');
        render();
    });

    // --- Modal Preparation ---
    $('#taskModal').on('show.bs.modal', function(event) {
        taskForm.trigger('reset');
        const button = $(event.relatedTarget);
        
        if (button.hasClass('edit-task')) {
            const taskId = button.closest('.task-item').attr('id');
            const task = tasks.find(t => t.id === taskId);
            $('#taskModalLabel').text('Edit Task');
            $('#taskId').val(task.id);
            $('#taskTitle').val(task.title);
            $('#taskDescription').val(task.description);
            $('#taskPriority').val(task.priority);
            $('#taskStatus').val(task.status);
        } else {
            $('#taskModalLabel').text('Add New Task');
            $('#taskId').val('');
        }
    });

    // --- Delete Task ---
    taskList.on('click', '.delete-task', function(e) {
        e.preventDefault();
        const taskId = $(this).closest('.task-item').attr('id');
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            save();
            render();
        }
    });

    // --- Add/Edit Form Submission ---
    taskForm.on('submit', function(e) {
        e.preventDefault();
        const taskId = $('#taskId').val();
        
        if (taskId) {
            const task = tasks.find(t => t.id === taskId);
            task.title = $('#taskTitle').val();
            task.description = $('#taskDescription').val();
            task.priority = $('#taskPriority').val();
            task.status = $('#taskStatus').val();
        } else {
            tasks.push({
                id: `task_${Date.now()}`,
                title: $('#taskTitle').val(),
                description: $('#taskDescription').val(),
                priority: $('#taskPriority').val(),
                status: $('#taskStatus').val()
            });
        }
        
        save();
        render();
        taskModal.hide();
    });

    // =================================================================
    // UTILITY
    // =================================================================
    /**
     * Generates the HTML for a single task.
     * @param {object} task The task object.
     * @returns {string} The task HTML.
     */
    const getTaskHtml = (task) => {
        const statusMap = {
            completed: { class: 'status-completed', text: 'Completed' },
            'in-progress': { class: 'status-in-progress', text: 'In Progress' },
            todo: { class: 'status-todo', text: 'To Do' }
        };
        const status = statusMap[task.status] || statusMap.todo;
        return `
            <div class="task-item" id="${task.id}" data-priority="${task.priority}" data-status="${task.status}">
                <div class="priority-indicator" data-priority="${task.priority}"></div>
                <div class="task-details">
                    <h5 class="task-title">${task.title}</h5>
                    <p class="task-description task-description-collapsible collapsed">${task.description}</p>
                </div>
                <div class="task-actions">
                    <span class="task-status ${status.class}">${status.text}</span>
                    <button class="btn btn-sm btn-action btn-edit edit-task" data-bs-toggle="modal" data-bs-target="#taskModal" aria-label="Edit Task">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-action btn-delete delete-task" aria-label="Delete Task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>`;
    };

    // --- INITIALIZATION ---
    load();

    // --- EVENT LISTENERS ---
    $('#task-form').on('submit', handleFormSubmit);
    $('#task-list').on('click', '.edit-task', handleEditClick);
    $('#task-list').on('click', '.delete-task', handleDeleteClick);
    
    $('#task-list').on('click', '.task-description-collapsible', function() {
        $(this).toggleClass('collapsed');
    });

    $('#task-controls').on('click', '.filter-option', function (e) {
        e.preventDefault();
        state.filterBy = $(this).data('filter');
        render();
    });

    $('#task-controls').on('click', '.sort-option', function (e) {
        e.preventDefault();
        state.sortBy = $(this).data('sort');
        render();
    });

    $('#taskModal').on('hidden.bs.modal', () => {
        $('#task-form')[0].reset();
        $('#task-id').val('');
        $('#modal-title').text('Add Task');
    });
});
