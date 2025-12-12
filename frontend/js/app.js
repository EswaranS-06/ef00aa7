
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
    user: null,
    currentProject: null,
    theme: 'dark'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});
