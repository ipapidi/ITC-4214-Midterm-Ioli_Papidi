document.addEventListener('DOMContentLoaded', function() {
    // Get tasks from localStorage
    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem('tasque_tasks')) || [];
    } catch (e) {
        tasks = [];
    }
    console.log('Loaded tasks:', tasks);
    // Filter for high priority (case-insensitive, trims whitespace)
    const highPriority = tasks.filter(t => (t.priority || '').toString().trim().toLowerCase() === 'high');
    console.log('High priority tasks:', highPriority);
    // Sort by createdAt descending if available, else by id descending, else as is
    highPriority.sort((a, b) => {
        if (a.createdAt && b.createdAt) return b.createdAt.localeCompare(a.createdAt);
        if (a.id && b.id) return b.id.localeCompare(a.id);
        return 0;
    });
    const top3 = highPriority.slice(0, 3);

    const carouselInner = document.getElementById('latest-activity-carousel-inner');
    if (carouselInner) {
        carouselInner.innerHTML = '';
        if (top3.length === 0) {
            carouselInner.innerHTML = '<div class="carousel-item active"><div class="latest-activity-card-outer"><div class="latest-activity-card"><div class="latest-activity-title mb-1">No high priority tasks found.</div></div></div></div>';
        } else {
            top3.forEach((task, idx) => {
                const item = document.createElement('div');
                item.className = 'carousel-item' + (idx === 0 ? ' active' : '');
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
                carouselInner.appendChild(item);
            });
        }
    }
}); 