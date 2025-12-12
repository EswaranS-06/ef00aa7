
/**
 * VAPT Pro - Core Application Logic
 * 
 * Handles routing, state management, and basic UI interactions.
 */

const routes = {
    '/': 'pages/auth/login.html',
    '/dashboard': 'pages/dashboard.html',
    '/projects': 'pages/projects/list.html',
    '/projects/create': 'pages/projects/create.html',
    '/project': 'pages/projects/overview.html', // requires ?id=xyz
    '/vuln/add': 'pages/vulns/add.html',
    '/vuln': 'pages/vulns/details.html',
    '/reports': 'pages/reports/preview.html',
    '/settings': 'pages/settings.html',
    '/users': 'pages/users/list.html',
    '/forgot-password': 'pages/auth/forgot-password.html'
};

class Router {
    constructor() {
        this.app = document.getElementById('app');
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        document.body.addEventListener('click', e => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(e.target.href);
            }
            // Handle bubbled clicks for elements inside anchors
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                this.navigateTo(link.href);
            }
        });

        this.handleRoute();
    }

    navigateTo(url) {
        history.pushState(null, null, url);
        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        const routePath = path === '/index.html' ? '/' : path; // Handle local file opening

        // Simple client-side router logic
        // For static file serving, we might strictly use hash routing or query params if not on a real server
        // But assuming a dev server that falls back to index.html or we use hash routing.

        // Let's implement Hash Routing for easier local testing without complex server config
        const hash = window.location.hash || '#/';
        const cleanHash = hash.replace('#', '');

        console.log(`Navigating to: ${cleanHash}`);

        // Default to login if root
        let templatePath = routes[cleanHash];

        // Mock fallback for now
        if (!templatePath) {
            if (cleanHash === '/') templatePath = routes['/'];
            else templatePath = 'pages/404.html';
        }

        await this.loadPage(templatePath);
    }

    async loadPage(path) {
        try {
            this.app.innerHTML = '<div class="flex-center" style="height:100vh"><div class="loader"></div></div>'; // Simple loader

            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();

            this.app.innerHTML = html;
            this.app.classList.add('fade-in');

            // Re-run scripts in the injected HTML if any (browser doesn't execute <script> in innerHTML)
            // For this architecture, we will rely on module imports in the value of the route or event based initialization
            this.triggerPageInit();

        } catch (e) {
            console.error('Page load failed', e);
            this.app.innerHTML = '<h1>Error loading page</h1><p>Check console for details.</p>';
        }
    }

    triggerPageInit() {
        // Dispatch a custom event that specific page scripts can listen to
        const event = new Event('page-loaded');
        document.dispatchEvent(event);
    }
}

// Global State Store (Simple)
const store = {
    user: {
        name: 'Admin User',
        role: 'Administrator', // or 'Analyst'
        email: 'admin@vapt.com'
    },
    currentProject: null,
    theme: 'dark'
};

// Role Management UI Helper
function updateRoleUI() {
    const isAdmin = store.user.role === 'Administrator';

    // Toggle Body Class
    if (!isAdmin) {
        document.body.classList.add('role-analyst');
    } else {
        document.body.classList.remove('role-analyst');
    }

    // Update Sidebar Info (if present)
    const nameEls = document.querySelectorAll('.user-name-display');
    const roleEls = document.querySelectorAll('.user-role-display');

    nameEls.forEach(el => el.textContent = store.user.name);
    roleEls.forEach(el => el.textContent = store.user.role);
}

// Window Helper for Testing
window.setRole = (role) => {
    store.user.role = role;
    store.user.name = role === 'Administrator' ? 'Admin User' : 'Jane Doe (Analyst)';
    updateRoleUI();
    console.log(`Role switched to: ${role}`);
};

// Theme Management Helper
function updateThemeUI() {
    const body = document.body;
    const toggle = document.getElementById('themeToggle');

    // Default to dark if not set
    if (!store.theme) store.theme = 'dark';

    if (store.theme === 'light') {
        body.classList.add('light-theme');
        if (toggle) toggle.checked = false; // "Dark Mode" off means Light Mode
    } else {
        body.classList.remove('light-theme');
        if (toggle) toggle.checked = true; // "Dark Mode" on
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
    window.router.originalLoadPage = window.router.loadPage;

    // Monkey patch loadPage to run logic after render
    window.router.loadPage = async function (path) {
        await window.router.originalLoadPage.call(window.router, path);
        updateRoleUI();
        updateThemeUI();

        // Ensure sidebar is in correct state (Default collapsed)
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
        }

        // Re-attach listener if on settings page
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                store.theme = e.target.checked ? 'dark' : 'light';
                updateThemeUI();
            });
        }
    };

    // Sidebar Toggle Helper
    window.toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    };

    updateRoleUI(); // Initial check
    updateThemeUI(); // Initial check
});
