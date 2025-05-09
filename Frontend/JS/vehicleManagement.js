
import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";

let allVehicles = [];
document.addEventListener('DOMContentLoaded', async () => {
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
    let userData = await checkUser();
    if (!userData || userData.user_type !== 'admin') {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
        return;
    }

    get_vehicle();


    const tableBody = document.querySelector(".table_body");

    tableBody.addEventListener("click", function (e) {
        const clickedRow = e.target.closest("tr.clickable-row");

        if (!clickedRow) return;

        const vehicleId = clickedRow.dataset.vehicleId;

        const nextRow = clickedRow.nextElementSibling;
        if (nextRow?.classList.contains("action-row")) {
            nextRow.remove(); // collapse current
        } else {
            document.querySelectorAll(".action-row").forEach(row => row.remove()); // collapse others

            const actionRow = document.createElement("tr");
            actionRow.className = "action-row";

            const td = document.createElement("td");
            td.colSpan = 4;
            td.innerHTML = `
                <div class="action-buttons">
                    <button class="edit-vehicle-btn details-btn" data-vehicle-id="${vehicleId}">Edit</button>
                    <button class="delete_vehicle-btn delete-btn" data-vehicle-id="${vehicleId}">Delete</button>
                </div>
            `;
            actionRow.appendChild(td);
            clickedRow.after(actionRow);
        }



    });


    // Optional: handle clicks on buttons
    document.addEventListener("click", (e) => {


        if (e.target.classList.contains("edit-vehicle-btn")) {
            const row = e.target.closest("tr").previousElementSibling;
            console.log("Selected row:", row.innerHTML);
            const cells = row.querySelectorAll("td");
            console.log(e.target.dataset.vehicleId)
            edit_vehicle(e.target.dataset.vehicleId, cells[0].textContent, cells[1].textContent)
        } else if (e.target.classList.contains("delete_vehicle-btn")) {

            delete_vehicle(e.target.dataset.vehicleId)

        }

    });

    // Event listener for search and filter
    const searchBox = document.getElementById("searchBox");
    const roleFilter = document.getElementById("roleFilter");

    searchBox.addEventListener("input", applySearchAndFilter);
    roleFilter.addEventListener("change", applySearchAndFilter);

    function applySearchAndFilter() {
        const query = searchBox.value.toLowerCase();
        const selectedRole = roleFilter.value.toLowerCase();

        const filtered = allVehicles.filter(vehicle => {
            const type = `${vehicle.vehicle_type}`.toLowerCase();
            const status = (vehicle.status || "").toLowerCase();
            const license = (vehicle.license_no || "").toLowerCase();
            const assigned = (vehicle.assigned_to?.email || "").toLowerCase();

            const matchesSearch = type.includes(query) || status.includes(query) || assigned.includes(query) || license.includes(query);
            const matchesRole = !selectedRole || type === selectedRole;

            return matchesSearch && matchesRole;
        });

        renderVehicleTable(filtered);
    }

});

function renderVehicleTable(users) {
    const tbody = document.querySelector('.table_body');
    tbody.innerHTML = '';
    users.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('clickable-row');
        row.dataset.vehicleId = item.id;
        row.innerHTML = `
            <td>${item.vehicle_type || ""}</td>
            <td>${item.license_no || ""}</td>
            <td>${item.status || ""}</td>
            <td>${item.latitude || ""}, ${item.longitude || ""}</td>
            <td>${item.assigned_to?.email || ""}</td>

        `;
        tbody.appendChild(row);
    });
}

//==========================
//Change vehicle Status
//==========================
async function edit_vehicle(id, type, license) {
    alert(id)
    document.getElementById('vehicleEditModal').style.display = 'block';

    document.getElementById('vehicle_Type').value = type;
    document.getElementById('licenseNo').value = license

    document.getElementById('vehicleEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        let form = document.getElementById('vehicleEditForm');
        let assignedVehicle = new FormData(form);
        let payload = Object.fromEntries(assignedVehicle.entries());
        console.log(payload);


        try {
            const response = await fetch(`${BASE_URL}vehicle/update/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(data)
            const messageBox = document.getElementById("vehicleMessageBox");

            if (response.ok) {
                messageBox.textContent = "Vehicle updated successfully.";
                messageBox.style.display = "block";
                messageBox.style.color = "green";

                setTimeout(() => messageBox.style.display = "none", 3000);
            } else {
                // Error Message
                messageBox.textContent = data.status || "Failed to assign an Area.";
                messageBox.style.display = "block";
                messageBox.style.color = "red";
            }


        } catch (error) {
            console.error("Unexpected error occurred:", error);
            if (messageBox) {
                messageBox.textContent = "Unexpected error occurred.";
                messageBox.style.display = "block";
                messageBox.style.color = "red";
            }
        }
    })
    document.querySelector(".vehicleEditClose").addEventListener("click", function () {
        document.getElementById("vehicleEditModal").style.display = "none";
    });

    // Optional: close modal when clicking outside
    window.addEventListener("click", function (e) {
        const modal = document.getElementById("vehicleEditModal");
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}



//==========================
//Register new vehicle
//==========================

const addBinBtn = document.getElementById("addBtn");
const modal = document.getElementById("vehicleModal");
const closeBtn = document.querySelector(".close-btn");
const form = modal.querySelector("#vehicle_form");

// Open modal
addBinBtn.addEventListener("click", () => {
    modal.style.display = "block";
    document.getElementById("vehicle_form").addEventListener("submit", (e) => {
        e.preventDefault();
        let form = document.getElementById("vehicle_form");
        const messageBox = document.getElementById("vehicleFormMessage");
        messageBox.textContent = "";
        messageBox.style.color = "";

        const formData = new FormData(form);

        const submitBtn = form.querySelector(".submit-btn");
        const payload = Object.fromEntries(formData.entries());
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";
        console.log(payload)

        fetch(`${BASE_URL}vehicle/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify(payload)

        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    messageBox.textContent = data.error;
                    messageBox.style.color = "red";

                } else {
                    messageBox.textContent = "✅ Vehicle Registered successfully!";
                    messageBox.style.color = "green";
                    form.reset();
                    modal.style.display = "none";
                    get_vehicle()
                }
            })
            .catch(error => {
                messageBox.textContent = error
                messageBox.style.color = "red";
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerText = "Add new Vehicle";
            });

    });

});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});



async function get_vehicle() {
    try {
        const response = await fetch(`${BASE_URL}vehicle/`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();
        console.log('vehicle', data)
        if (response.ok) {
            allVehicles = data;
            renderVehicleTable(data)
            return data
        } else {
            console.error("Error fetching vehicles:", data);
        }
    } catch (error) {
        console.error("Unexpected error while fetching vehicles:", error);
    }
}

async function delete_vehicle(id) {
    alert(id)
    let messageBox = document.getElementById('messageBox');
    try {
        const response = await fetch(`${BASE_URL}vehicle/delete/${id}/`, {
            method: 'DELETE',
            headers: {
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        messageBox.style.display = 'block';
        if (response.ok) {
            if (response.status === 204) {
                messageBox.textContent = '✅ Area deleted successfully!';
                messageBox.className = 'message-box success';
                get_vehicle();
            }
        } else {
            return response.json();
        }
    } catch (error) {
        console.error("Unexpected error while fetching vehicles:", error);
    }
}

document.getElementById("logoutBtn").addEventListener('click', function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem('redirectAfterLogin')
    window.location.href = "../index.html";

})