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

    // ===== Page Loader =====
    function hideLoader() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.classList.add('hidden');
            // Remove loader from DOM after transition
            setTimeout(() => {
                loader.remove();
            }, 500);
        }
    }

    // Hide loader when page is fully loaded
    window.addEventListener('load', () => {
        // Minimum display time for loader (1.5 seconds)
        setTimeout(hideLoader, 1500);
    });

    // ===== Custom Cursor =====
    function initCustomCursor() {
        const cursorGlow = document.querySelector('.cursor-glow');
        const cursorDot = document.querySelector('.cursor-dot');

        if (!cursorGlow || !cursorDot) return;

        // Check if device supports hover (not touch device)
        const supportsHover = window.matchMedia('(hover: hover)').matches;
        if (!supportsHover) return;

        // Show cursor
        cursorGlow.classList.add('active');
        cursorDot.classList.add('active');

        let cursorX = 0;
        let cursorY = 0;
        let glowX = 0;
        let glowY = 0;

        // Update cursor position on mouse move
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;

            // Update dot position immediately
            cursorDot.style.left = cursorX + 'px';
            cursorDot.style.top = cursorY + 'px';
        });

        // Smooth glow follow animation
        function animateGlow() {
            glowX += (cursorX - glowX) * 0.1;
            glowY += (cursorY - glowY) * 0.1;

            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';

            requestAnimationFrame(animateGlow);
        }
        animateGlow();

        // Add hover effect on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .glass-card, .skill-tag, input, textarea');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('cursor-hover');
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursorGlow.style.display = 'none';
            cursorDot.style.display = 'none';
        });

        document.addEventListener('mouseenter', () => {
            cursorGlow.style.display = 'block';
            cursorDot.style.display = 'block';
        });
    }

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
        const navActions = document.querySelector('.nav-actions');

        if (!menuBtn || !navLinks) return;

        // Toggle menu
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !menuBtn.contains(e.target)) {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
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
                date: "2026-03-10",
                title: "I’ve taught thousands of people how to use AI – here’s what I’ve learned",
                summary: "The Guardian 报道了 AI 领域的最新动态，该新闻反映了当前人工智能技术在行业应用、研究进展或市场趋势方面的发展。",
                link: "https://news.google.com/search?q=AI+news&hl=en-US"
            },
            {
                date: "2026-03-10",
                title: "Better Artificial Intelligence (AI) Stock to Buy in March: Nvidia vs. Taiwan Semiconductor Manufacturing Co.",
                summary: "英伟达发布新的 AI 芯片或平台，继续巩固其在 AI 硬件领域的领导地位。",
                link: "https://news.google.com/search?q=AI+news&hl=en-US"
            },
            {
                date: "2026-03-10",
                title: "Help us improve how we explain AI and privacy",
                summary: "Wausau Pilot & Review 报道了 AI 领域的最新动态，该新闻反映了当前人工智能技术在行业应用、研究进展或市场趋势方面的发展。",
                link: "https://news.google.com/search?q=AI+news&hl=en-US"
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

    // ===== Image Carousel =====
    function initCarousel() {
        const carousels = document.querySelectorAll('.carousel');

        carousels.forEach(carousel => {
            const dots = carousel.querySelectorAll('.carousel-dot');
            const track = carousel.querySelector('.carousel-track');
            const slides = track ? track.querySelectorAll('.carousel-slide') : [];

            if (dots.length === 0 || slides.length === 0) return;

            let currentSlide = 0;
            let autoRotateTimer = null;
            const slideInterval = 4000; // 4 seconds per slide

            // Go to specific slide
            function goToSlide(index) {
                currentSlide = index;
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
                updateDots(currentSlide);
            }

            // Update active dot
            function updateDots(index) {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            }

            // Next slide
            function nextSlide() {
                currentSlide = (currentSlide + 1) % slides.length;
                goToSlide(currentSlide);
            }

            // Start auto-rotation
            function startAutoRotate() {
                stopAutoRotate();
                autoRotateTimer = setInterval(nextSlide, slideInterval);
            }

            // Stop auto-rotation
            function stopAutoRotate() {
                if (autoRotateTimer) {
                    clearInterval(autoRotateTimer);
                    autoRotateTimer = null;
                }
            }

            // Click on dots to switch slides
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    goToSlide(index);
                    // Reset auto-rotation timer after manual click
                    startAutoRotate();
                });
            });

            // Initialize
            goToSlide(0);
            startAutoRotate();
        });
    }

    // ===== Collaborative Memory Form =====
    function initMemoryForm() {
        const form = document.getElementById('memory-form');
        if (!form) return;

        // EmailJS Configuration - Replace with your own keys
        const EMAILJS_PUBLIC_KEY = 'RO5CZO2-pDosL1sGB';        // EmailJS Public Key
        const EMAILJS_SERVICE_ID = 'service_1ufl6gb';      // EmailJS Service ID
        const EMAILJS_TEMPLATE_ID = 'template_lz9cb9z';    // EmailJS Template ID

        // Initialize EmailJS
        if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
        }

        const formTags = form.querySelectorAll('.form-tag');
        const submitBtn = form.querySelector('.sync-btn');
        const memoryCard = form.closest('.memory-card');

        console.log('Form tags found:', formTags.length);

        if (!submitBtn || !memoryCard) return;

        let selectedCategory = '自由话题';

        // Form tag selection
        formTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Tag clicked:', tag.dataset.value);
                formTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                selectedCategory = tag.dataset.value;
                console.log('Selected category:', selectedCategory);
            });
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('guest-name');
            const emailInput = document.getElementById('guest-email');
            const messageInput = document.getElementById('guest-message');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!message) {
                alert('请输入留言内容');
                return;
            }

            // Disable button and show loading
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading-spinner"></div>';

            try {
                // Prepare email template parameters
                const templateParams = {
                    from_name: name || '匿名用户',
                    from_email: email || '未提供',
                    category: selectedCategory,
                    message: message,
                    to_email: 'swuct@connect.ust.hk',
                    submit_time: new Date().toLocaleString('zh-CN')
                };

                console.log('Sending email with params:', templateParams);
                console.log('EmailJS available:', typeof emailjs !== 'undefined');

                // Send email via EmailJS
                if (typeof emailjs !== 'undefined') {
                    const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
                    console.log('Email sent successfully:', response);
                } else {
                    throw new Error('EmailJS SDK not loaded');
                }

                // Add success state to card for full-card transform animation
                memoryCard.classList.add('success-state');

            } catch (error) {
                console.error('Submission error:', error);
                alert('提交失败: ' + (error.message || error.text || '请稍后重试'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    // ===== Copy to Clipboard =====
    function initCopyToClipboard() {
        const copyItems = document.querySelectorAll('.contact-link-item');

        copyItems.forEach(item => {
                item.addEventListener('click', async () => {
                    const value = item.dataset.copy;
                    if (!value) return;

                    try {
                        await navigator.clipboard.writeText(value);

                        // Show feedback
                        const hint = item.querySelector('.copy-hint');
                        if (hint) {
                            hint.textContent = '已复制!';
                            setTimeout(() => {
                                hint.textContent = 'Click to copy';
                            }, 2000);
                        }
                    } catch (err) {
                        console.error('Copy failed:', err);
                    }
                });
            });
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
        initCarousel();
        initCustomCursor();
        initMemoryForm();
        initCopyToClipboard();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
