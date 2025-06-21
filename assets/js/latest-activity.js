// Latest Activity
document.addEventListener('DOMContentLoaded', function() {
    // Get tasks from localStorage
    let tasks = []; 
    try {
        tasks = JSON.parse(localStorage.getItem('tasque_tasks')) || []; // Get tasks from localStorage
    } catch (e) {
        tasks = []; 
    }
    console.log('Loaded tasks:', tasks); // Log the tasks
    // Filter for high priority
    const highPriority = tasks.filter(t => (t.priority || '').toString().trim().toLowerCase() === 'high'); 
    console.log('High priority tasks:', highPriority); 
    // Sort by createdAt descending if available, else by id descending, else as is
    highPriority.sort((a, b) => {
        if (a.createdAt && b.createdAt) return b.createdAt.localeCompare(a.createdAt); 
        if (a.id && b.id) return b.id.localeCompare(a.id); 
        return 0;
    });
    const top3 = highPriority.slice(0, 3); // Get the top 3 high priority tasks

    const carouselInner = document.getElementById('latest-activity-carousel-inner'); // Get the carousel inner element
    if (carouselInner) {
        carouselInner.innerHTML = ''; // Clear the carousel inner element
        if (top3.length === 0) {
            carouselInner.innerHTML = '<div class="carousel-item active"><div class="latest-activity-card-outer"><div class="latest-activity-card"><div class="latest-activity-title mb-1">No high priority tasks found.</div></div></div></div>'; // If no high priority tasks are found, show a message
        } else {
            top3.forEach((task, idx) => {
                const item = document.createElement('div'); // Create a new div element
                item.className = 'carousel-item' + (idx === 0 ? ' active' : ''); // Add the carousel item class and active class if it's the first item
                // Add the HTML for the carousel item
                item.innerHTML = ` 
                    <div class="latest-activity-card-outer">
                      <div class="latest-activity-card">
                        <div class="latest-activity-title mb-1">${task.title}</div>
                        <div class="latest-activity-desc mb-2">${task.description || ''}</div>
                        <div class="latest-activity-badge-row">
                          <span class="latest-activity-badge mb-2">High Priority</span>
                        </div>
                        <a href="tasks/index.html" class="latest-activity-btn">View All Tasks</a>
                      </div>
                    </div>
                `;
                carouselInner.appendChild(item); // Add the item to the carousel inner element
            });
        }
    }
}); 