// Service Worker for TheGeeksInfo Website - Full PWA Implementation
// Version 1.3.0

const CACHE_NAME = 'thegeeksinfo-v1.3';
const STATIC_CACHE_NAME = 'thegeeksinfo-static-v1.3';
const DYNAMIC_CACHE_NAME = 'thegeeksinfo-dynamic-v1.3';

// Define what to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/css/animations.css',
    '/assets/js/main.js',
    '/assets/images/logo300x300.png',
    '/assets/images/logo-transparent.webp',
    '/assets/images/hero-a.webp',
    '/assets/images/vision.webp',
    '/assets/images/intelligenza-artificiale-nella-PA-2-scaled-2.webp',
    '/assets/images/shutterstock_1483438988-2.webp',
    '/assets/images/visione-green-fanton-azienda.webp',
    '/manifest.json',
    // Add offline fallback page
    '/offline.html'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE_NAME)
                .then(function(cache) {
                    console.log('Caching static assets...');
                    return cache.addAll(STATIC_ASSETS);
                }),
            // Cache external assets
            caches.open(DYNAMIC_CACHE_NAME)
                .then(function(cache) {
                    console.log('Caching external assets...');
                    return cache.addAll(EXTERNAL_ASSETS);
                })
        ])
        .then(() => {
            console.log('Service Worker installation complete');
            // Force activation
            return self.skipWaiting();
        })
        .catch(function(error) {
            console.log('Cache failed:', error);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating...');
    
    const currentCaches = [CACHE_NAME, STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (!currentCaches.includes(cacheName)) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all pages
            self.clients.claim()
        ])
        .then(() => {
            console.log('Service Worker activation complete');
        })
    );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    
    // Handle different types of requests with appropriate caching strategies
    if (event.request.destination === 'document') {
        // Network-first for HTML documents
        event.respondWith(handleDocumentRequest(event.request));
    } else if (STATIC_ASSETS.some(asset => event.request.url.includes(asset))) {
        // Cache-first for static assets
        event.respondWith(handleStaticAssetRequest(event.request));
    } else if (url.hostname !== location.hostname) {
        // Stale-while-revalidate for external resources
        event.respondWith(handleExternalRequest(event.request));
    } else {
        // Network-first with cache fallback for other requests
        event.respondWith(handleNetworkFirstRequest(event.request));
    }
});

// Network-first strategy for documents
async function handleDocumentRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed for document, serving from cache:', error);
        
        // Try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to offline page
        return caches.match('/offline.html');
    }
}

// Cache-first strategy for static assets
async function handleStaticAssetRequest(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Failed to fetch static asset:', error);
        throw error;
    }
}

// Stale-while-revalidate for external resources
async function handleExternalRequest(request) {
    const cachedResponse = await caches.match(request);
    
    // Return cached version immediately if available
    if (cachedResponse) {
        // Update cache in background
        fetch(request).then(response => {
            if (response.ok) {
                const cache = caches.open(DYNAMIC_CACHE_NAME);
                cache.then(c => c.put(request, response));
            }
        }).catch(error => {
            console.log('Background update failed for external resource:', error);
        });
        
        return cachedResponse;
    }
    
    // No cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Failed to fetch external resource:', error);
        throw error;
    }
}

// Network-first with cache fallback
async function handleNetworkFirstRequest(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, serving from cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Background sync for form submissions
self.addEventListener('sync', function(event) {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(
            syncContactForm()
        );
    }
});

// Push notifications
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/images/icon-192x192.png',
            badge: '/assets/images/badge-72x72.png',
            vibrate: [200, 100, 200],
            data: {
                url: data.url
            },
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/assets/images/view-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: '/assets/images/dismiss-icon.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Helper function to sync contact form data
async function syncContactForm() {
    try {
        // Get pending form submissions from IndexedDB
        const pendingSubmissions = await getPendingSubmissions();
        
        for (const submission of pendingSubmissions) {
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submission.data)
                });

                if (response.ok) {
                    await removePendingSubmission(submission.id);
                    console.log('Form submission synced successfully');
                }
            } catch (error) {
                console.log('Failed to sync form submission:', error);
            }
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

// IndexedDB helpers for offline form submissions
function getPendingSubmissions() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TheGeeksInfoDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['formSubmissions'], 'readonly');
            const store = transaction.objectStore('formSubmissions');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('formSubmissions')) {
                db.createObjectStore('formSubmissions', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function removePendingSubmission(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TheGeeksInfoDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['formSubmissions'], 'readwrite');
            const store = transaction.objectStore('formSubmissions');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

// Message event for communication with main thread
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker loaded successfully');
