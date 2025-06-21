$(document).ready(function() {
    // APPLICATION STATE (The single source of truth)
    let tasks = [];
    let currentFilter = 'all';
    let currentSort = 'none';

    // DOM ELEMENTS CACHE
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal')); // Get the task modal element
    const taskForm = $('#taskForm'); // Get the task form element
    const taskList = $('.task-list'); // Get the task list element
    const taskSummary = $('#task-summary'); // Get the task summary element

    // CORE LOGIC (Manipulate state, then call render)

    // The single, master function to render the UI from the state.
    const render = () => {
        let tasksToRender = [...tasks]; // Create a copy of the tasks array

        // 1. FILTERING
        // Filter the tasks to render based on the current filter
        if (currentFilter !== 'all') {
            tasksToRender = tasksToRender.filter(task => 
                task.priority === currentFilter || task.status === currentFilter // Filter by priority or status
            );
        }

        // 2. SORTING
        if (currentSort !== 'none') {
            tasksToRender.sort((a, b) => {
                if (currentSort === 'priority') {
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }; // Define the priority order
                    return priorityOrder[b.priority] - priorityOrder[a.priority]; // Sort by priority
                }
                if (currentSort === 'status') {
                    const statusOrder = { 'todo': 3, 'in-progress': 2, 'completed': 1 }; // Define the status order
                    return statusOrder[b.status] - statusOrder[a.status]; // Sort by status
                }
                return 0;
            });
        }

        // 3. RENDER TO DOM
        taskList.empty();
        if (tasksToRender.length === 0) {
            if (tasks.length === 0) {
                taskSummary.text('You have no tasks yet. Add one to get started!'); // If there are no tasks, show a message
            } else {
                taskSummary.text('No tasks match the current filter.'); // If there are tasks, show a message
            }
            taskList.html('<p class="text-center text-muted mt-4">No tasks match the current view.</p>');
        } else {
            if (tasks.length > tasksToRender.length) {
                taskSummary.text(`Displaying ${tasksToRender.length} of ${tasks.length} tasks.`); // If there are more tasks than the current filter, show a message
            } else {
                taskSummary.text(`Displaying all ${tasks.length} tasks.`); // If there are no more tasks than the current filter, show a message
            }
            tasksToRender.forEach(task => taskList.append(getTaskHtml(task))); // Render the tasks to the DOM
        }
    };

    // Saves the entire `tasks` array to localStorage.
    const save = () => {
        localStorage.setItem('tasque_tasks', JSON.stringify(tasks)); 
    };

    // Loads tasks from localStorage or initializes the app from HTML templates.

    const load = () => {
        const storedTasks = localStorage.getItem('tasque_tasks'); 
        if (storedTasks) {
            tasks = JSON.parse(storedTasks); 
        } else {
            // First time load: parse the HTML templates to create the initial state.
            tasks = []; // Initialize the tasks array
            $('.task-item-initial').each(function() { // Loop through the task item initial elements
                const taskEl = $(this); // Get the task item initial element
                tasks.push({
                    id: `task_${Date.now()}_${tasks.length}`, // Create a unique id for the task
                    title: taskEl.find('.task-title').text(), // Get the title of the task
                    description: taskEl.find('.task-description').text(), // Get the description of the task
                    priority: taskEl.data('priority'), // Get the priority of the task
                    status: taskEl.data('status'), // Get the status of the task
                });
            });
            save(); // Save the tasks
        }
        render();
    };

    // EVENT HANDLERS (Only update state, then call save and render)

    // View Options (Filter & Sort)
    $('.filter-option').on('click', function(e) {
        e.preventDefault();
        currentFilter = $(this).data('filter'); // Get the filter from the data attribute
        render(); // Render the tasks
    });

    $('.sort-option').on('click', function(e) {
        e.preventDefault(); 
        currentSort = $(this).data('sort'); // Get the sort from the data attribute
        render(); 
    });

    // Modal Preparation 
    $('#taskModal').on('show.bs.modal', function(event) {
        taskForm.trigger('reset'); 
        const button = $(event.relatedTarget); // Get the button that triggered the modal
        
        if (button.hasClass('edit-task')) { // If the button has the class 'edit-task'
            const taskId = button.closest('.task-item').attr('id'); // Get the id of the task item
            const task = tasks.find(t => t.id === taskId); // Find the task in the tasks array
            $('#taskModalLabel').text('Edit Task'); // Set the modal label to 'Edit Task'
            $('#taskId').val(task.id); // Set the task id input value to the task id
            $('#taskTitle').val(task.title); 
            $('#taskDescription').val(task.description); 
            $('#taskPriority').val(task.priority); 
            $('#taskStatus').val(task.status); 
        } else {
            $('#taskModalLabel').text('Add New Task'); 
            $('#taskId').val(''); 
        }
    });

    // Delete Task 
    taskList.on('click', '.delete-task', function(e) {
        e.preventDefault();
        const taskId = $(this).closest('.task-item').attr('id'); // Get the id of the task item
        if (confirm('Are you sure you want to delete this task?')) { 
            tasks = tasks.filter(task => task.id !== taskId); 
            save();
            render();
        }
    });

    // Add/Edit Form Submission 
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

    // Task Description Toggle
    taskList.on('click', '.task-description-collapsible', function() {
        $(this).toggleClass('collapsed');
    });

    // UTILITY
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
        const status = statusMap[task.status] || statusMap.todo; // Get the status of the task
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

    // INITIALIZATION
    load();
});
