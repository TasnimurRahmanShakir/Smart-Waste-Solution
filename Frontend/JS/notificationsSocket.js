// notificationSocket.js
document.addEventListener("DOMContentLoaded", () => {
    
    if (localStorage.getItem('new_notification') === 'true') {
        showNotificationIndicator();
    } else {
        hideNotificationIndicator();
    }

    // If we're on the notifications page, hide dot
    if (window.location.pathname.includes("notification.html")) {
        hideNotificationIndicator();
    }

    setupWebSocket();

   
});

function setupWebSocket() {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/`);

    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "authenticate",
            token: localStorage.getItem('access_token')
        }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Only show dot if not on the notifications page
        if (!window.location.pathname.includes("notification.html")) {
            showNotificationIndicator();
        }

        // Add to list only if list exists (avoid error on pages without it)
        addNotificationToList(data.message, data.created_at);
    };

    socket.onclose = () => {
        console.warn("⚠️ WebSocket closed unexpectedly");
    };
}

function addNotificationToList(message, timestamp) {
    const list = document.getElementById("notificationList");
    if (!list) return;

    const li = document.createElement("li");
    li.className = "notification";
    const createdAt = new Date(timestamp).toLocaleString();
    li.textContent = `${message} [${createdAt}]`;
    list.prepend(li);
}

function showNotificationIndicator() {
    localStorage.setItem('new_notification', 'true');
    const dot = document.getElementById('sidebarNotificationDot');
    if (dot) dot.style.display = 'inline';
}

function hideNotificationIndicator() {
    localStorage.setItem('new_notification', 'false');
    const dot = document.getElementById('sidebarNotificationDot');
    if (dot) dot.style.display = 'none';
}
