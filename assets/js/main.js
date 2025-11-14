// Main JavaScript for TheGeeksInfo Website

// DOM Elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const contactForm = document.getElementById('contact-form');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    preloadCriticalImages();
    ensureLogoLoading();
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializePortfolioFilter();
    initializeContactForm();
    initializeCounters();
    initializeTypingEffect();
    initializeApplicationModal();
    
    // Initialize Meeting Scheduler
    meetingScheduler = new MeetingScheduler();
});

// Preload critical images for better performance
function preloadCriticalImages() {
    const criticalImages = [
        'assets/images/logo300x300.png'
    ];
    
    criticalImages.forEach(imageSrc => {
        const img = new Image();
        img.onload = function() {
            // Image loaded successfully
            console.log('Preloaded:', imageSrc);
        };
        img.onerror = function() {
            // Fallback if image fails to load
            console.warn('Failed to preload:', imageSrc);
        };
        img.src = imageSrc;
    });
}

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    function highlightActiveSection() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveSection);
}

// Scroll effects
function initializeScrollEffects() {
    // Navbar background on scroll
    function updateNavbar() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbar);

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = hero.querySelector('.hero-visual');
            if (parallax) {
                const speed = scrolled * 0.5;
                parallax.style.transform = `translateY(${speed}px)`;
            }
        });
    }
}

// Intersection Observer for animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger counter animation if it's a stat element
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.service-card, .program-card, .portfolio-item, .about-text, .contact-info, .stat'
    );

    animatedElements.forEach(element => {
        element.classList.add('fade-in-observer');
        observer.observe(element);
    });
}

// Portfolio filter functionality
function initializePortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter portfolio items
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease-in-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Contact form functionality
function initializeContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const service = formData.get('service');
        const message = formData.get('message');
        
        // Validate form
        if (!name || !email || !service || !message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Create mailto link to send email to thegeeksinformation@gmail.com
        const subject = encodeURIComponent(`New Contact Form Submission from ${name} - ${service}`);
        const body = encodeURIComponent(`
Hello TheGeeksInfo Team,

You have received a new contact form submission from your website:

Name: ${name}
Email: ${email}
Service Interested: ${service}

Message:
${message}

---
Please reply to this person at: ${email}

This message was sent from the TheGeeksInfo contact form.
        `);
        
        const mailtoLink = `mailto:thegeeksinformation@gmail.com?subject=${subject}&body=${body}`;
        
        // Show success message
        showNotification('Opening your email client to send the message to thegeeksinformation@gmail.com...', 'success');
        
        // Open mailto link
        window.location.href = mailtoLink;
        
        // Reset form after a short delay
        setTimeout(() => {
            contactForm.reset();
        }, 1000);
    });
}

// Form validation
function validateForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('Please enter a valid name');
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }

    if (!data.service) {
        errors.push('Please select a service');
    }

    if (!data.message || data.message.trim().length < 10) {
        errors.push('Please enter a message with at least 10 characters');
    }

    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }

    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        animation: slideInDown 0.3s ease-out;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Close functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.style.animation = 'slideInUp 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInUp 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Counter animation
function initializeCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) return;

    const now = new Date();

    statNumbers.forEach(element => {
        const baseValue = parseInt(element.dataset.base ?? element.dataset.target ?? element.textContent, 10);
        if (Number.isNaN(baseValue)) {
            return;
        }

        const increment = parseInt(element.dataset.increment ?? '0', 10);
        const startDateAttr = element.dataset.start;

        let computedTarget = baseValue;

        if (startDateAttr && !Number.isNaN(increment) && increment !== 0) {
            const startDate = new Date(startDateAttr);

            if (!Number.isNaN(startDate.getTime())) {
                let monthsElapsed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());

                if (now.getDate() < startDate.getDate()) {
                    monthsElapsed -= 1;
                }

                monthsElapsed = Math.max(0, monthsElapsed);
                computedTarget = baseValue + monthsElapsed * increment;
            }
        }

        element.dataset.target = computedTarget;
        element.textContent = String(computedTarget);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60 FPS
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Typing effect for hero section
function initializeTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;

    const text = heroTitle.textContent;
    const gradientText = heroTitle.querySelector('.gradient-text');
    
    if (gradientText) {
        const gradientTextContent = gradientText.textContent;
        const beforeGradient = text.substring(0, text.indexOf(gradientTextContent));
        const afterGradient = text.substring(text.indexOf(gradientTextContent) + gradientTextContent.length);

        // Clear the title
        heroTitle.innerHTML = '';

        // Add typing animation
        let i = 0;
        const typeWriter = () => {
            if (i < beforeGradient.length) {
                heroTitle.innerHTML += beforeGradient.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else if (i === beforeGradient.length) {
                heroTitle.innerHTML += `<span class="gradient-text">${gradientTextContent}</span>`;
                i++;
                setTimeout(typeWriter, 50);
            } else if (i - beforeGradient.length - 1 < afterGradient.length) {
                const currentAfterIndex = i - beforeGradient.length - 1;
                const currentAfterText = afterGradient.substring(0, currentAfterIndex + 1);
                heroTitle.innerHTML = beforeGradient + `<span class="gradient-text">${gradientTextContent}</span>` + currentAfterText;
                i++;
                setTimeout(typeWriter, 50);
            }
        };

        // Start typing effect after a delay
        setTimeout(typeWriter, 1000);
    }
}

// Enhanced logo loading with performance optimization
function ensureLogoLoading() {
    const logoImages = document.querySelectorAll('.logo-image');
    let loadAttempts = 0;
    const maxRetries = 3;
    
    logoImages.forEach((img, index) => {
        // Set initial state
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease-in-out';
        
        // Performance optimization
        img.style.willChange = 'opacity, transform';
        
        // Advanced error handling with exponential backoff
        img.addEventListener('error', function() {
            loadAttempts++;
            console.warn(`Logo failed to load (attempt ${loadAttempts}/${maxRetries})`);
            
            if (loadAttempts <= maxRetries) {
                const retryDelay = Math.pow(2, loadAttempts) * 100; // Exponential backoff
                setTimeout(() => {
                    this.src = this.src.split('?')[0] + '?retry=' + Date.now() + '_' + loadAttempts;
                }, retryDelay);
            } else {
                // Final fallback - show placeholder or hide
                this.style.opacity = '0.3';
                this.style.filter = 'grayscale(100%)';
                console.error('Logo failed to load after all retries');
            }
        });
        
        // Enhanced load event with performance monitoring
        img.addEventListener('load', function() {
            console.log(`Logo loaded successfully (index: ${index})`);
            this.style.opacity = '1';
            this.style.willChange = 'auto'; // Reset will-change for performance
            
            // Mark as loaded for other scripts
            this.setAttribute('data-loaded', 'true');
            
            // Trigger custom event for other components
            document.dispatchEvent(new CustomEvent('logoLoaded', { 
                detail: { index: index, img: this } 
            }));
        });
        
        // Intersection Observer for lazy loading optimization (for footer logo)
        if (index > 0) { // Apply only to non-critical logos
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(img);
        }
        
        // Force reload check with enhanced detection
        if (img.complete) {
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                // Image failed to load properly, force reload
                img.src = img.src.split('?')[0] + '?force=' + Date.now();
            } else {
                // Image loaded successfully
                img.style.opacity = '1';
                img.setAttribute('data-loaded', 'true');
            }
        }
        
        // Timeout fallback
        setTimeout(() => {
            if (!img.getAttribute('data-loaded')) {
                console.warn('Logo loading timeout, applying fallback');
                img.style.opacity = '0.5';
            }
        }, 5000);
    });
    
    // Preload next priority images after logo loads
    document.addEventListener('logoLoaded', function() {
        console.log('Logo loaded, starting secondary asset preload');
    });
}

// Application Modal functionality
function initializeApplicationModal() {
    const modal = document.getElementById('applicationModal');
    const applyButtons = document.querySelectorAll('.apply-now-btn');
    const closeBtn = document.querySelector('.close-modal');
    const modalTitle = document.querySelector('.modal-header h2');
    
    // Track modal state to prevent multiple openings
    let isModalOpen = false;
    
    // Open modal when Apply Now buttons are clicked
    applyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent multiple modal openings
            if (isModalOpen) return;
            
            const programName = this.getAttribute('data-program') || 'Our Program';
            modalTitle.textContent = `Apply for ${programName}`;
            
            isModalOpen = true;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Refresh iframe to prevent caching issues
            const iframe = document.getElementById('applicationForm');
            if (iframe) {
                iframe.src = iframe.src;
            }
            
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'application_modal_opened', {
                    program_name: programName
                });
            }
        });
    });
    
    // Close modal when X is clicked
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside of it
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    function closeModal() {
        if (!isModalOpen) return;
        
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
        isModalOpen = false;
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'application_modal_closed');
        }
    }
}

// Meeting Scheduler Class
class MeetingScheduler {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.timeFormat = 12; // 12 or 24 hour format
        
        // Available time slots (24-hour format)
        this.availableSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ];
        
        // Initialize scheduler if elements exist
        if (this.checkElements()) {
            this.init();
        }
    }
    
    checkElements() {
        return document.getElementById('calendarDays') && 
               document.getElementById('currentMonth') && 
               document.getElementById('timeSlots');
    }
    
    init() {
        this.renderCalendar();
        this.bindEvents();
    }
    
    bindEvents() {
        // Calendar navigation
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
                this.hideTimeSlots();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
                this.hideTimeSlots();
            });
        }
        
        // Time format toggle
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.timeFormat = parseInt(e.target.dataset.format);
                if (this.selectedDate) {
                    this.renderTimeSlots();
                }
            });
        });
        
        // Schedule button
        const scheduleBtn = document.getElementById('scheduleBtn');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => {
                this.scheduleMeeting();
            });
        }
    }
    
    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Update month header
        const monthHeader = document.getElementById('currentMonth');
        if (monthHeader) {
            monthHeader.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
        
        // Generate calendar days
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        calendarDays.innerHTML = '';
        
        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            
            // Add classes based on date status
            if (date.getMonth() !== this.currentDate.getMonth()) {
                dayElement.classList.add('other-month');
            } else if (date >= new Date().setHours(0,0,0,0) && this.isDateAvailable(date)) {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', () => this.selectDate(date));
            } else if (date < new Date().setHours(0,0,0,0)) {
                dayElement.classList.add('unavailable');
            }
            
            calendarDays.appendChild(dayElement);
        }
    }
    
    isDateAvailable(date) {
        // Don't allow weekends for now
        const day = date.getDay();
        return day !== 0 && day !== 6; // Not Sunday or Saturday
    }
    
    selectDate(date) {
        this.selectedDate = date;
        this.selectedTime = null; // Reset selected time
        
        // Update selected date in calendar
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        event.target.classList.add('selected');
        
        // Show time slots
        this.showTimeSlots();
        
        // Update selected date header
        const selectedDateElement = document.getElementById('selectedDate');
        if (selectedDateElement) {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            selectedDateElement.textContent = `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`;
        }
        
        this.renderTimeSlots();
    }
    
    showTimeSlots() {
        const timeSlots = document.getElementById('timeSlots');
        if (timeSlots) {
            timeSlots.style.display = 'block';
        }
    }
    
    hideTimeSlots() {
        const timeSlots = document.getElementById('timeSlots');
        if (timeSlots) {
            timeSlots.style.display = 'none';
        }
        this.selectedDate = null;
        this.selectedTime = null;
        this.updateScheduleButton();
    }
    
    renderTimeSlots() {
        const timeGrid = document.getElementById('timeGrid');
        if (!timeGrid) return;
        
        timeGrid.innerHTML = '';
        
        this.availableSlots.forEach(slot => {
            const timeElement = document.createElement('div');
            timeElement.className = 'time-slot';
            timeElement.textContent = this.formatTime(slot);
            
            // Check if slot is available
            if (this.isTimeSlotAvailable(slot)) {
                timeElement.addEventListener('click', () => this.selectTime(slot, timeElement));
            } else {
                timeElement.classList.add('unavailable');
            }
            
            timeGrid.appendChild(timeElement);
        });
    }
    
    isTimeSlotAvailable(time) {
        // For demo purposes, make some random slots unavailable
        const unavailable = ['09:30', '11:00', '14:30', '16:00'];
        return !unavailable.includes(time);
    }
    
    selectTime(time, element) {
        this.selectedTime = time;
        
        // Update selected time in grid
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        element.classList.add('selected');
        
        this.updateScheduleButton();
    }
    
    updateScheduleButton() {
        const scheduleBtn = document.getElementById('scheduleBtn');
        if (scheduleBtn) {
            if (this.selectedDate && this.selectedTime) {
                scheduleBtn.style.display = 'block';
                scheduleBtn.disabled = false;
            } else {
                scheduleBtn.style.display = 'none';
                scheduleBtn.disabled = true;
            }
        }
    }
    
    formatTime(time24) {
        if (this.timeFormat === 24) {
            return time24;
        }
        
        const [hours, minutes] = time24.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'pm' : 'am';
        return `${hour12}:${minutes}${ampm}`;
    }
    
    scheduleMeeting() {
        if (!this.selectedDate || !this.selectedTime) {
            this.showNotification('Please select both a date and time for your meeting.', 'error');
            return;
        }
        
        const formattedDate = this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const formattedTime = this.formatTime(this.selectedTime);
        
        // Create mailto link with meeting details
        const subject = encodeURIComponent('Meeting Request - Project Discussion');
        const body = encodeURIComponent(`Hello TheGeeksInfo Team,

I would like to schedule a meeting to discuss my project.

Preferred Meeting Details:
- Date: ${formattedDate}
- Time: ${formattedTime} (Africa/Kampala timezone)
- Duration: 30 minutes
- Platform: Google Meet

Project Details:
[Please describe your project and goals here]

Looking forward to hearing from you!

Best regards`);
        
        const mailtoLink = `mailto:thegeeksinformation@gmail.com?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
        
        // Show confirmation
        this.showNotification(`Meeting request sent! We'll confirm your appointment for ${formattedDate} at ${formattedTime}.`, 'success');
        
        // Reset selections
        this.resetScheduler();
    }
    
    resetScheduler() {
        this.selectedDate = null;
        this.selectedTime = null;
        
        // Clear visual selections
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        this.hideTimeSlots();
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    padding: 16px 20px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification-success {
                    border-left: 4px solid #28a745;
                }
                
                .notification-error {
                    border-left: 4px solid #dc3545;
                }
                
                .notification-info {
                    border-left: 4px solid #17a2b8;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .notification-content i {
                    font-size: 1.2rem;
                }
                
                .notification-success i {
                    color: #28a745;
                }
                
                .notification-error i {
                    color: #dc3545;
                }
                
                .notification-info i {
                    color: #17a2b8;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
}

// Initialize Meeting Scheduler
let meetingScheduler;
