// ===== Personal Website JavaScript =====
// Tech-focused portfolio with 3D animations and glass morphism effects

(function() {
    'use strict';

    // ===== DOM Elements =====
    const body = document.body;
    const html = document.documentElement;
    const nav = document.querySelector('.glass-nav');
    const heroCanvas = document.getElementById('hero-canvas');

    // ===== State =====
    let mouseX = 0;
    let mouseY = 0;

    // ===== Theme Toggle =====
    function initThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        // Get saved theme or use system preference
        const getSavedTheme = () => {
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            return prefersDark.matches ? 'dark' : 'light';
        };

        // Apply theme
        const applyTheme = (theme) => {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            // Update theme-color meta tag for mobile browsers
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (themeColorMeta) {
                themeColorMeta.setAttribute('content', theme === 'light' ? '#FFFFFF' : '#0A0A0F');
            }

            // Swap favicon based on theme
            const favicon = document.querySelector('link[rel="icon"]');
            const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
            if (theme === 'light') {
                if (favicon) favicon.href = 'favicon-light.svg';
                if (appleTouchIcon) appleTouchIcon.href = 'favicon-light.svg';
            } else {
                if (favicon) favicon.href = 'favicon-dark.svg';
                if (appleTouchIcon) appleTouchIcon.href = 'favicon-dark.svg';
            }

            // Swap hero background image based on theme
            const heroBgImage = document.querySelector('.hero-bg-image');
            if (heroBgImage) {
                if (theme === 'light') {
                    heroBgImage.src = 'images/hero-bg-light.png';
                } else {
                    heroBgImage.src = 'images/hero-bg.png';
                }
            }

            // Update navigation background based on current scroll position
            const nav = document.querySelector('.glass-nav');
            if (nav) {
                const currentScroll = window.pageYOffset;
                const scrolled = currentScroll > 100;
                if (theme === 'light') {
                    nav.style.background = scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)';
                } else {
                    nav.style.background = scrolled ? 'rgba(10, 10, 15, 0.98)' : 'rgba(10, 10, 15, 0.8)';
                }
            }
        };

        // Initialize theme
        applyTheme(getSavedTheme());

        // Toggle theme on button click
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                applyTheme(newTheme);
            });
        }

        // Listen for system theme changes
        prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // ===== 3D Particle Background =====
    function initParticleBackground() {
        if (!heroCanvas) return;

        const ctx = heroCanvas.getContext('2d');
        if (!ctx) return;

        let width, height;
        let particles = [];
        let animationId;

        // Detect mobile device for performance optimization
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

        // Configuration - reduced particle count for better performance
        const config = {
            particleCount: isMobile ? 8 : 20,
            connectionDistance: isMobile ? 80 : 120,
            mouseDistance: 150,
            baseSpeed: isMobile ? 0.1 : 0.2,
            colors: ['#A78BFA', '#8B5CF6', '#C4B5FD', '#DDD6FE']
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * config.baseSpeed;
                this.vy = (Math.random() - 0.5) * config.baseSpeed;
                this.radius = Math.random() * 2 + 1;
                this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
                this.angle = Math.random() * Math.PI * 2;
                this.spin = (Math.random() - 0.5) * 0.02;
            }

            update() {
                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseDistance) {
                    const force = (config.mouseDistance - distance) / config.mouseDistance;
                    this.vx -= (dx / distance) * force * 0.02;
                    this.vy -= (dy / distance) * force * 0.02;
                }

                // Update position
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.spin;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Limit velocity
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 1) {
                    this.vx = (this.vx / speed) * 1;
                    this.vy = (this.vy / speed) * 1;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                // Draw particle with glow
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 3);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(0.5, this.color + '80');
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        function init() {
            resize();
            particles = [];
            for (let i = 0; i < config.particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            heroCanvas.width = width;
            heroCanvas.height = height;
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = (1 - distance / config.connectionDistance) * 0.3;
                        ctx.strokeStyle = `rgba(167, 139, 250, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Draw connections first (behind particles)
            drawConnections();

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationId = requestAnimationFrame(animate);
        }

        // Event listeners
        window.addEventListener('resize', () => {
            resize();
            // Re-init particles with new config if viewport changes significantly
            const newIsMobile = window.innerWidth <= 768;
            if (newIsMobile !== isMobile) {
                location.reload();
            }
        });

        // Visibility handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Initialize
        init();
        animate();
    }

    // ===== Navigation =====
    function initNavigation() {
        let lastScroll = 0;

        // Get computed styles for theme-aware colors
        const getNavBg = (scrolled) => {
            const theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'light') {
                return scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.9)';
            }
            return scrolled ? 'rgba(10, 10, 15, 0.98)' : 'rgba(10, 10, 15, 0.8)';
        };

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add/remove scrolled class
            if (currentScroll > 100) {
                nav.style.background = getNavBg(true);
                nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
            } else {
                nav.style.background = getNavBg(false);
                nav.style.boxShadow = 'none';
            }

            // Hide/show nav on scroll
            if (currentScroll > lastScroll && currentScroll > 200) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        });

        // Smooth scroll for nav links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ===== Scroll Animations =====
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.glass-card, .skill-card, .work-item, .reading-section');

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ===== Mobile Menu =====
    function initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        if (!menuBtn || !navLinks) return;

        // Toggle menu
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });

        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });

        // Close menu when clicking outside
        navLinks.addEventListener('click', (e) => {
            if (e.target === navLinks) {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    }

    // ===== Skills Marquee Animation =====
    function initSkillsMarquee() {
        const skillsSection = document.querySelector('.skills');
        const marqueeTracks = document.querySelectorAll('.marquee-track');

        if (!skillsSection || marqueeTracks.length === 0) return;

        // Use Intersection Observer to control animation
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // When skills section is visible, play animation
                    marqueeTracks.forEach(track => {
                        track.classList.remove('paused');
                    });
                } else {
                    // When skills section is not visible, pause animation
                    marqueeTracks.forEach(track => {
                        track.classList.add('paused');
                    });
                }
            });
        }, observerOptions);

        observer.observe(skillsSection);
    }

    // ===== AI News Section =====
    function initAINews() {
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) return;

        const newsData = [
            {
                date: "2026-02-25",
                title: "Claude Sonnet 4.6 发布",
                summary: "Anthropic 发布 Claude Sonnet 4.6，作为 claude.ai 的新默认模型，在编码一致性方面表现更佳，SWE-bench 得分达到 79.6%，接近 Opus 级别性能但保持 Sonnet 定价。",
                link: "https://www.cnbc.com/2026/02/17/anthropic-ai-claude-sonnet-4-6-default-free-pro.html"
            },
            {
                date: "2026-02-24",
                title: "GPT-5.2 正式发布",
                summary: "OpenAI 正式推出 GPT-5.2 模型，带来重大升级。该模型在多模态理解、长上下文处理和推理能力方面有显著提升，支持超百万 token 上下文窗口。",
                link: "https://tech.yahoo.com/ai/chatgpt/articles/openai-just-released-gpt-5-141531710.html"
            },
            {
                date: "2026-02-23",
                title: "DeepSeek 新模型即将发布",
                summary: "中国 AI 公司 DeepSeek 即将发布新一代 AI 模型，预计将在编程和数学推理方面继续领先，可能对全球 AI 市场格局产生重要影响。",
                link: "https://www.cnbc.com/2026/02/23/deepseek-to-release-new-ai-model-a-rough-period-for-nasdaq-stocks-could-follow.html"
            }
        ];

        newsGrid.innerHTML = newsData.map(news => `
            <article class="news-card glass-card">
                <div class="news-content">
                    <span class="news-date">${news.date}</span>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-summary">${news.summary}</p>
                    <a href="${news.link}" target="_blank" class="news-link">
                        阅读全文
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <line x1="7" y1="17" x2="17" y2="7"></line>
                            <polyline points="7 7 17 7 17 17"></polyline>
                        </svg>
                    </a>
                </div>
            </article>
        `).join('');
    }

    // ===== Initialize Everything =====
    function init() {
        initThemeToggle();
        initParticleBackground();
        initNavigation();
        initScrollAnimations();
        initMobileMenu();
        initSkillsMarquee();
        initAINews();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
