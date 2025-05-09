import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";

document.addEventListener("DOMContentLoaded", async function () {
    // UI Toggles
    document.getElementById("navToggle").addEventListener("click", () => {
        document.getElementById("navLinks").classList.toggle("show");
    });
    document.getElementById("sidebarToggle").addEventListener("click", () => {
        document.getElementById("sidebarLinks").classList.toggle("show");
    });
    document.querySelector('.profile img').addEventListener('click', function () {
        document.querySelector('.dropdown').classList.toggle('show');
    });

    // Auth Check
    const userData = await checkUser();
    if (!userData) {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
        return;
    }

    // Hide indicator if visiting notifications
    hideNotificationIndicator();

    // Load existing + start WebSocket
    get_notification();
    setupWebSocket();
});

async function get_notification() {
    try {
        const response = await fetch(`${BASE_URL}notification/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        const data = await response.json();

        const list = document.getElementById("notificationList");
        list.innerHTML = "";

        data.forEach(notification => {
            addNotificationToList(notification.message, notification.created_at);
        });

    } catch (error) {
        console.error("Failed to load notifications:", error);
    }
}

function setupWebSocket() {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/`);

    socket.onopen = () => {
        console.log("WebSocket connected.");
        socket.send(JSON.stringify({ type: "authenticate", token: localStorage.getItem('access_token') }));
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (!window.location.pathname.includes("notification.html")) {
            showNotificationIndicator();
        }
        
        addNotificationToList(data.message, data.created_at);
        showNotificationIndicator();
    };

    socket.onclose = function () {
        console.warn('WebSocket closed unexpectedly');
    };
}

function addNotificationToList(message, timestamp) {
    const list = document.getElementById("notificationList");
    if (!list) return; // Avoid errors on pages without list
    const li = document.createElement("li");
    li.className = "notification";
    const createdAt = new Date(timestamp).toLocaleString();
    li.textContent = `${message} [${createdAt}]`;
    list.prepend(li);
}

// --- 🔴 Notification Dot Handlers ---

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

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('new_notification') === 'true') {
        showNotificationIndicator();
    }
});

document.getElementById("logoutBtn").addEventListener('click', function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem('redirectAfterLogin')
    window.location.href = "../index.html";

})