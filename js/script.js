// ── Theme Toggle ──
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function setTheme(theme) {
    document.body.classList.toggle('light', theme === 'light');
    if (themeIcon) {
        themeIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
    localStorage.setItem('theme', theme);
}

// Apply saved theme on load
setTheme(getPreferredTheme());

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light');
        setTheme(isLight ? 'dark' : 'light');
    });
}

// ── Mobile Hamburger Menu ──
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// ── Navbar Hide on Scroll Down, Show on Scroll Up ──
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
});

// ── Smooth Scroll for Anchor Links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ── Dynamic Project Loading from JSON ──
function loadProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    // Determine the correct path to the JSON file
    const isInPages = window.location.pathname.includes('/pages/');
    const jsonPath = isInPages ? '../data/projects.json' : 'data/projects.json';

    fetch(jsonPath)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load projects');
            return response.json();
        })
        .then(projects => {
            grid.innerHTML = '';
            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card';

                const hasBg = project.backgroundImage && project.backgroundImage.trim() !== '';
                const previewStyle = hasBg
                    ? `style="background-image: url('${project.backgroundImage}'); background-size: cover; background-position: center;"`
                    : '';

                let overlayHtml = '';
                if (project.playableLink) {
                    overlayHtml = '<div class="project-overlay">';
                    if (project.playableLink && project.playableLink.trim() !== '') {
                        overlayHtml += `<a href="${project.playableLink}" target="_blank" rel="noopener noreferrer" class="btn btn-small"><i class="fas fa-external-link-alt"></i> Play</a>`;
                    }
                    overlayHtml += '</div>';
                }

                const tagsHtml = project.tags.map(tag => `<span>${tag}</span>`).join('');

                card.innerHTML = `
                    <div class="project-preview" ${previewStyle}>
                        <div class="project-placeholder">
                        </div>
                        ${overlayHtml}
                    </div>
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-tags">
                            ${tagsHtml}
                        </div>
                        <div class="project-downloads">
                            <span>Downloads: ${project.downloads}</span> 
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Failed to load projects.</p>';
        });
}

// Load projects when DOM is ready
document.addEventListener('DOMContentLoaded', loadProjects);