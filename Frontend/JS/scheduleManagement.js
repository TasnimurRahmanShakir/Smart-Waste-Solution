import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";


let allSchedule = []
document.addEventListener('DOMContentLoaded', async function () {

    let userData = await checkUser();
    if (userData.user_type !== 'admin') {

        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html'
    }

    get_schedule();

    const scheduleBtn = document.getElementById('addBtn');
    const scheduleModal = document.getElementById('scheduleModal');
    const closeScheduleModal = document.getElementById('closeScheduleModal');

    const dailyBtn = document.getElementById('dailyBtn');
    const emergencyBtn = document.getElementById('emergencyBtn');
    const dailyForm = document.getElementById('dailyForm');
    const emergencyForm = document.getElementById('emergencyForm');

    // Show Modal
    scheduleBtn.addEventListener('click', () => {
        scheduleModal.style.display = 'block';
        if (dailyForm.style.display !== 'none') {
            dailySchedule();
        }
    });

    // Close Modal
    closeScheduleModal.addEventListener('click', () => {
        scheduleModal.style.display = 'none';
    });

    // Toggle between Daily and Emergency
    dailyBtn.addEventListener('click', () => {
        dailyForm.style.display = 'block';
        emergencyForm.style.display = 'none';
        dailyBtn.classList.add('active');
        emergencyBtn.classList.remove('active');

        dailySchedule()

    });

    emergencyBtn.addEventListener('click', () => {
        emergencyForm.style.display = 'block';
        dailyForm.style.display = 'none';
        emergencyBtn.classList.add('active');
        dailyBtn.classList.remove('active');
    });

    // Close when clicking outside modal
    window.addEventListener('click', (event) => {
        if (event.target === scheduleModal) {
            scheduleModal.style.display = 'none';
        }
    });
});

//========================
// Fetching Functionality
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

        console.log(data)
        if (response.ok) {
            allSchedule = data;
            renderScheduleTable(data)
        } else {
            console.error("Error fetching user data:", data.message);
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
        row.classList.add('clickable-row');
        row.dataset.scheduleId = item.id;
        row.innerHTML = `
            <td>${item.schedule_type || "Not Available"}</td>
            <td>${item.area?.area_name || "Not Available"}</td>
            <td>${item.requested_by?.email || "Not Available"}</td>
            <td>${item.accepted_by?.email || "Not Available"}</td>
            <td>${item.status || "Not Available"}</td>
            <td><button class="deleteBtn" value=${item.id}>Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}


//===============================
// Daily Schedule Functionality
//===============================

async function dailySchedule() {
    const allArea = await get_area();
    console.log(allArea)
    const tbody = document.querySelector('#dailySchedule');
    tbody.innerHTML = '';
    allArea.forEach(area => {
        console.log(area)
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${area.name || "Not Available"}</td>
            <td><Button class="submitBtn" data-area-id="${area.id}">Create</Button></td>
        `
        tbody.appendChild(row);
    })


    document.querySelector('#dailySchedule').addEventListener('click', (e) => {
        if (e.target?.classList?.contains('submitBtn')) {
            let id = e.target.dataset.areaId;
            const payload = {
                'area': id,
                'schedule_type': 'daily'
            }
            const messageBox = document.getElementById("scheduleMessageBox");
            messageBox.textContent = "";
            messageBox.style.color = ""; 

            const submitBtn = document.querySelector('#dailySchedule').querySelector(".submitBtn");
            submitBtn.disabled = true;
            submitBtn.innerText = "Submitting...";

            fetch(`${BASE_URL}schedule/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    return response.json().then(data => {
                        console.log("RESPONSE STATUS:", response);
                        console.log("RESPONSE BODY:", data);

                        if (response.ok) {
                            messageBox.textContent = data.message || "✅ Daily Schedule created successfully!";
                            messageBox.style.color = "green";
                            get_area();
                            get_schedule();
                            scheduleModal.style.display = "none";
                        } else {
                            messageBox.textContent = data.error || "❌ Failed to create schedule.";
                            messageBox.style.color = "red";
                        }
                    });
                })
                .catch(error => {
                    messageBox.textContent = "❌ Network error: " + error.message;
                    messageBox.style.color = "red";
                });


                

        }
    });
}


async function get_area() {
    try {
        const response = await fetch(`${BASE_URL}schedule/area/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            return data
        } else {
            console.error("Error fetching user data:", data.message);
        }
    } catch (error) {
        console.error("Unexpected error:", error);
    }
}


//========================
// Delete Functionality
//========================
document.querySelector('.table_body').addEventListener('click', (e) => {
    if (e.target?.classList?.contains('deleteBtn')) {
        const binId = e.target.value;
        alert(`Delete button clicked for bin with ID: ${binId}`);
        const messageBox = document.getElementById('messageBox');


        fetch(`${BASE_URL}schedule/delete/${binId}/`, {
            method: 'DELETE',
            headers: {
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(response => {
                messageBox.style.display = 'block';
                if (response.ok) {
                    if (response.status === 204) {
                        messageBox.textContent = '✅ Schedule deleted successfully!';
                        messageBox.className = 'message-box success';
                        get_schedule();
                    }
                } else {
                    return response.json();
                }
            })
            .then(data => {
                if (data) {
                    messageBox.style.display = 'block';
                    messageBox.textContent = `❌ Error deleting Schedule: ${data.error || 'Unknown error'}`;
                    messageBox.className = 'message-box error';
                }
            })
            .catch(error => {
                messageBox.style.display = 'block';
                messageBox.textContent = `❌ Network error or API failure: ${error.message}`;
                messageBox.className = 'message-box error';
            });
    }
});