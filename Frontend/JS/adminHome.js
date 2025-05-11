import { checkUser } from './auth.js';
import { BASE_URL } from './config.js';


document.addEventListener("DOMContentLoaded", async () => {

    // Top nav toggle
    document.getElementById("navToggle").addEventListener("click", () => {
        document.getElementById("navLinks").classList.toggle("show");
    });

    // Sidebar toggle
    document.getElementById("sidebarToggle").addEventListener("click", () => {
        document.getElementById("sidebarLinks").classList.toggle("show");
    });

    // Profile dropdown toggle

    document.querySelector('.profile img').addEventListener('click', function () {
        const dropdown = document.querySelector('.dropdown');
        dropdown.classList.toggle('show');

    });
    let userData = await checkUser()
    if (!userData || userData.user_type !== 'admin') {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
        return;
    }

    


    get_summary();

    populateAreaDropdown();
});
async function get_summary() {
    console.log("Fetching summary data...");

    try {
        const response = await fetch(`${BASE_URL}summary/admin-dashboard/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        document.getElementById('today_pickup').innerText = data.today_pickup;
        document.getElementById('pending_pickup').innerText = data.pending_schedule;
        document.getElementById('missed_pickup').innerText = data.missed_schedule;
        document.getElementById('total_user').innerText = data.total_user;
        document.getElementById('total_collector').innerText = data.total_collector;
        document.getElementById('total_waste').innerText = data.total_waste;


        set_chart_data(data.weekly_waste_data);

    } catch (error) {
        console.error('Error fetching summary:', error.message);
    }
}

async function set_chart_data(data) {
    const ctx = document.getElementById('wasteGraph').getContext('2d');
    const wasteGraph = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Waste Collected (kg)',
                data: data.data,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1,
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
document.getElementById("logoutBtn").addEventListener('click', function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem('redirectAfterLogin')
    window.location.href = "../index.html";

})

async function populateAreaDropdown() {
    try {
        const response = await fetch(`${BASE_URL}area/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch area list");
        }

        const areas = await response.json();
        const areaSelect = document.getElementById("areaSelect");

        areas.forEach(area => {
            const option = document.createElement("option");
            option.value = area.id;       
            option.textContent = area.area_name; 
            areaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading areas:", error.message);
    }
}

document.getElementById('announcementForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const areaId = document.getElementById('areaSelect').value;
    const message = document.getElementById('message').value;
    const messageBox = document.getElementById('messageBox');

    messageBox.style.display = 'none';
    messageBox.className = 'message-box';

    if (!areaId || !message.trim()) {
        messageBox.textContent = "Please select an area and enter a message.";
        messageBox.classList.add('error');
        messageBox.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}announcement/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                area: areaId,
                message: message.trim()
            })
        });

        const result = await response.json();

        if (response.ok) {
            messageBox.textContent = "✅ Announcement sent successfully!";
            messageBox.classList.add('success');
            messageBox.style.display = 'block';
            document.getElementById("announcementForm").reset();
        } else {
            const errorMessage = result.message || JSON.stringify(result);
            messageBox.textContent = `❌ Failed to send: ${errorMessage}`;
            messageBox.classList.add('error');
            messageBox.style.display = 'block';
        }

    } catch (error) {
        messageBox.textContent = "❌ Server error. Please try again.";
        messageBox.classList.add('error');
        messageBox.style.display = 'block';
        console.error('Error sending announcement:', error.message);
    }
});
