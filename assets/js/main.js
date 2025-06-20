(function() {
    // --- 1. SET INITIAL THEME ---
    // This part of the script runs immediately to prevent a flash of unstyled content.
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Get the saved theme from local storage or default to 'light'.
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);


    // --- 2. SETUP TOGGLE LISTENER ---
    // This part of the script waits for the DOM to be fully loaded before running.
    function setupToggle() {
        const toggle = document.getElementById('darkModeToggle');
        
        if (toggle) {
            // Sync the toggle state with the currently applied theme.
            toggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';

            // Listen for changes on the toggle.
            toggle.addEventListener('change', function() {
                const newTheme = this.checked ? 'dark' : 'light';
                // Apply the new theme to the page.
                applyTheme(newTheme);
                // Save the user's preference in local storage.
                localStorage.setItem('theme', newTheme);
            });
        }
    }

    // Wait until the DOM is ready to safely query for the toggle element.
    document.addEventListener('DOMContentLoaded', setupToggle);

})();