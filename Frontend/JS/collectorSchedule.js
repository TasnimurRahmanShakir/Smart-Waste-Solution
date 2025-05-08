import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";

let allSchedule = []
let currentScheduleId = null

document.addEventListener('DOMContentLoaded', async function () {

    document.getElementById("navToggle").addEventListener("click", () => {
        document.getElementById("navLinks").classList.toggle("show");
    });

    document.getElementById("sidebarToggle").addEventListener("click", () => {
        document.getElementById("sidebarLinks").classList.toggle("show");
    });

    document.querySelector('.profile img').addEventListener('click', function () {
        const dropdown = document.querySelector('.dropdown');
        dropdown.classList.toggle('show');
    });

    const userData = await checkUser();
    if (userData.user_type !== 'collector') {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
    }

    get_schedule();
});

//========================
// Fetch Schedule
//========================

async function get_schedule() {
    try {
        const response = await fetch(`${BASE_URL}schedule/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            allSchedule = data;
            renderScheduleTable(data);
        } else {
            console.error("Error fetching schedule data:", data.message);
        }
    } catch (error) {
        console.error("Unexpected error:", error);
    }
}

function renderScheduleTable(schedules) {
    const tbody = document.querySelector('.table_body');
    tbody.innerHTML = '';
    schedules.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.scheduleId = item.id;
        row.innerHTML = `
            <td>${item.schedule_type || "Not Available"}</td>
            <td>${item.area?.area_name || "Not Available"}</td>
            <td>${item.bins?.bin_id || "Not Available"}</td>
            <td>${item.status || "Not Available"}</td>
            <td><button class="acceptBtn details-btn" value=${item.id}>Accept</button></td>
            <td><button class="completeBtn details-btn" value=${item.id}>Complete</button></td>
        `;
        tbody.appendChild(row);
    });
}

//===============================
// Accept Schedule
//===============================

document.addEventListener('click', async function (e) {
    if (e.target.classList.contains('acceptBtn')) {
        const scheduleId = e.target.value;

        try {
            const response = await fetch(`${BASE_URL}schedule/accept/${scheduleId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({})
            });

            const result = await response.json();

            if (response.ok) {
                alert("Schedule accepted successfully!");
                get_schedule();
            } else {
                showMessage(result.error || "Something went wrong");
            }

        } catch (error) {
            showMessage("Network error or server unavailable");
            console.error("Error accepting schedule:", error);
        }
    }
});

//===============================
// Open Modal on Complete Button
//===============================

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('completeBtn')) {
        currentScheduleId = e.target.value;
        document.getElementById('scheduleModal').style.display = 'block';
    }
});

//===============================
// Close Modal
//===============================

document.querySelector('.close-btn').addEventListener('click', function () {
    document.getElementById('scheduleModal').style.display = 'none';
});

//===============================
// Submit Modal Form (Create Depot)
//===============================

document.getElementById('schedule_form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const weight = document.getElementById('weight').value;

    const userData = await checkUser();
    const userId = userData.id;

    try {
        const response = await fetch(`${BASE_URL}depot/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                weight: parseFloat(weight),
                submitted_by: userId
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Depot entry submitted successfully!");
            completeSchedule(currentScheduleId);
            document.getElementById('scheduleModal').style.display = 'none';
        } else {
            document.getElementById('scheduleFormMessage').innerText = result.error || "Error submitting depot data.";
        }

    } catch (error) {
        console.error("Error submitting depot data:", error);
        document.getElementById('scheduleFormMessage').innerText = "Network or server error.";
    }
});

//===============================
// Complete Schedule Functionality
//===============================

async function completeSchedule(scheduleId) {
    try {
        const response = await fetch(`${BASE_URL}schedule/update/${scheduleId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ status: 'completed' })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Schedule marked as completed!");
            get_schedule();
        } else {
            showMessage(result.error || "Error marking schedule as completed.");
        }
    } catch (error) {
        console.error("Error completing schedule:", error);
        showMessage("Network error or server unavailable.");
    }
}

//===============================
// Show Message Function
//===============================

function showMessage(message) {
    const box = document.getElementById('messageBox');
    box.innerText = message;
    box.style.display = 'block';
    box.style.color = 'red';
}

document.getElementById("logoutBtn").addEventListener('click', function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem('redirectAfterLogin')
    window.location.href = "../index.html";

})