const SERVICES = [
    `${import.meta.env.VITE_API_URL?.replace('/api', '')}/api/health`,
    'https://nexus-ai-service.onrender.com/health',
];

export function startKeepAlive() {
    if (import.meta.env.PROD) {
        // Initial ping on load
        SERVICES.forEach(url => fetch(url).catch(() => { }));

        // Ping every 10 mins to prevent Render sleep (free tier spins down after 15 min)
        setInterval(() => {
            SERVICES.forEach(url => fetch(url).catch(() => { }));
        }, 10 * 60 * 1000);
    }
}
