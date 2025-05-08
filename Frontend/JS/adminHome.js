import { checkUser } from './auth.js';
import { BASE_URL } from './config.js';


document.addEventListener("DOMContentLoaded", () => {

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



    get_summary();


});
async function get_summary() {
    console.log("Fetching summary data...");
    const userData = await checkUser();
    if (userData.user_type !== 'admin') {
        console.log("User data not found, Please login/register a new account.");
        return;
    }

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