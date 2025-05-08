
import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";

let allUsers = [];
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
    if (userData.user_type !== 'admin') {

        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html'
    }

    get_user_data();
    

    const tableBody = document.querySelector(".table_body");

    tableBody.addEventListener("click", function (e) {
        const clickedRow = e.target.closest("tr.clickable-row");

        if (!clickedRow) return;

        const userId = clickedRow.dataset.userId;

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
                    <button class="user-details-btn details-btn" data-user-id="${userId}">Details</button>
                    <button class="assign-vehicle-btn details-btn" data-user-id="${userId}">Assign Vehicle</button>
                    <button class="assign_area-btn details-btn" data-user-id="${userId}">Assign Area</button>
                </div>
            `;
            actionRow.appendChild(td);
            clickedRow.after(actionRow);
        }


        
    });


    // Optional: handle clicks on buttons
    document.addEventListener("click", (e) => {
       
        
        if (e.target.classList.contains("user-details-btn")) {
            user_profile(e.target.dataset.userId)
        } else if (e.target.classList.contains("assign-vehicle-btn")) {
            const row = e.target.closest("tr").previousElementSibling;
            console.log("Selected row:", row.innerHTML);
            
            const cells = row.querySelectorAll("td");
            if (cells[3].textContent === 'admin' || cells[3].textContent === 'helper' || cells[3].textContent === 'citizen') {
                alert(`Assigning Vehicle is not available for ${cells[3].textContent}`)
                return
            }

            assign_vehicle(e.target.dataset.userId, cells[1].textContent, cells[2].textContent)

        } else if (e.target.classList.contains('assign_area-btn')) {

            const row = e.target.closest("tr").previousElementSibling;
            console.log("Selected row:", row.innerHTML);
            const cells = row.querySelectorAll("td");

            if (cells[3].textContent === 'admin') {
                alert(`Assigning Area is not available for ${cells[3].textContent}`)
                return
            }

            assign_Area(e.target.dataset.userId, cells[1].textContent, cells[2].textContent)

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

        const filtered = allUsers.filter(user => {
            const name = `${user.first_name} ${user.last_name}`.toLowerCase();
            const email = (user.email || "").toLowerCase();
            const phone = (user.phone_number || "").toLowerCase();
            const role = (user.user_type || "").toLowerCase();

            const matchesSearch = name.includes(query) || email.includes(query) || phone.includes(query);
            const matchesRole = !selectedRole || role === selectedRole;

            return matchesSearch && matchesRole;
        });

        renderUserTable(filtered);
    }

});

async function get_user_data() {
    try {
        const response = await fetch(`${BASE_URL}user/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();
        

        if (response.ok) {
            allUsers = data;
            renderUserTable(data)
        } else {
            console.error("Error fetching user data:", data.message);
        }
    } catch (error) {
        console.error("Unexpected error:", error);
    }
}
function renderUserTable(users) {
    const tbody = document.querySelector('.table_body');
    tbody.innerHTML = '';
    users.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('clickable-row');
        row.dataset.userId = item.id;
        row.innerHTML = `
            <td>${item.first_name || ""} ${item.last_name || ""}</td>
            <td>${item.email || ""}</td>
            <td>${item.phone_number || ""}</td>
            <td>${item.user_type || ""}</td>
        `;
        tbody.appendChild(row);
    });
}


//=================
//User Details
//=================
async function user_profile(id) {
    try {
        const response = await fetch(`${BASE_URL}user/userProfile/${id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();
        console.log(data)
        if (response.ok) {

            document.getElementById("detailProfilePic").src = `http://127.0.0.1:8000${data.profile_image}`;
            document.getElementById("detailName").textContent = data.first_name + " " + data.last_name;
            document.getElementById("detailEmail").textContent = data.email;
            document.getElementById("detailPhone").textContent = data.phone_number;
            document.getElementById("detailAddress").textContent = data.address;
            document.getElementById("detailUserType").textContent = data.user_type;
            if ( data.user_type === 'collector' || data.user_type === 'helper') {
                const collectorElements = document.getElementsByClassName('onlyCollector');
                for (let el of collectorElements) {
                    el.style.display = 'inline';
                }
                document.getElementById("assignedVehicle").textContent = data.vehicle?.vehicle_type || "Not assigned";
                document.getElementById("assignedArea").textContent = data.area?.area_name || "Not assigned";
            } else {
                console.log("Hello")
            }
                

            document.getElementById("userDetailsModal").style.display = "block";


        } else {
            console.error("Error fetching user data:", data.message);
        }


    } catch (error) {
        console.error("Unexpected error:", error);
    }

    document.querySelector(".close-details-btn").addEventListener("click", function () {
        document.getElementById("userDetailsModal").style.display = "none";
    });

    window.addEventListener("click", function (e) {
        const modal = document.getElementById("userDetailsModal");
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

}

//=================
//Assign a vehicle
//=================
async function assign_vehicle(id, email, phone) {
    alert(id, email, phone)
    document.getElementById('userAssignVehicleModal').style.display = 'block';

    document.getElementById('userEmail').value = email;
    document.getElementById('userPhone').value = phone;

    populateVehicleDropdown();
    document.getElementById('userForm').addEventListener('submit',async (e) => {
        e.preventDefault();
        let form = document.getElementById('userForm');
        let assignedVehicle = new FormData(form);
        assignedVehicle.append('assigned_to', id);
        let payload = Object.fromEntries(assignedVehicle.entries());
        console.log(payload);

        const dropdown = document.getElementById("vehicle");
        const VehicleId = dropdown.value;

        
        try {
            const response = await fetch(`${BASE_URL}vehicle/assign/${VehicleId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(data)
            const messageBox = document.getElementById("VehiclemessageBox");

            if (response.ok) {
                messageBox.textContent = "Vehicle assigned successfully.";
                messageBox.style.display = "block";
                messageBox.style.color = "green";

                setTimeout(() => messageBox.style.display = "none", 3000);
            } else {
                // Error Message
                messageBox.textContent = data.assigned_to || "Failed to assign a vehicle.";
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
    document.querySelector(".close-user-btn").addEventListener("click", function () {
        document.getElementById("userAssignVehicleModal").style.display = "none";
    });

    // Optional: close modal when clicking outside
    window.addEventListener("click", function (e) {
        const modal = document.getElementById("userAssignVehicleModal");
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

async function populateVehicleDropdown() {
    let vehicleData = await get_vehicle()
    const dropdown = document.getElementById("vehicle");
    dropdown.innerHTML = '<option value="">--Select One--</option>';

    vehicleData.forEach(vehicle => {
        if (vehicle.assigned_to){
            const option = document.createElement("option");
            option.value = vehicle.id;
            option.textContent = vehicle.vehicle_type+" "+vehicle.license_no;
            dropdown.appendChild(option);
        }
        
    });
}

//=================
//Assign a Area
//=================
async function assign_Area(id, email, phone) {
    document.getElementById('userAssignAreaModal').style.display = 'block';

    document.getElementById('userforAreaEmail').value = email;
    document.getElementById('userforAreaPhone').value = phone


    populateAreaDropdown();
    document.getElementById('userAreaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        let form = document.getElementById('userAreaForm');
        let assignedVehicle = new FormData(form);
        let payload = Object.fromEntries(assignedVehicle.entries());
        console.log(payload);


        try {
            const response = await fetch(`${BASE_URL}user/update/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(data)
            const messageBox = document.getElementById("AreaMessageBox");

            if (response.ok) {
                messageBox.textContent = "Area assigned successfully.";
                messageBox.style.display = "block";
                messageBox.style.color = "green";

                setTimeout(() => messageBox.style.display = "none", 3000);
            } else {
                // Error Message
                messageBox.textContent = data.assigned_to || "Failed to assign an Area.";
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
    document.querySelector(".areaClose").addEventListener("click", function () {
        document.getElementById("userAssignAreaModal").style.display = "none";
    });

    // Optional: close modal when clicking outside
    window.addEventListener("click", function (e) {
        const modal = document.getElementById("userAssignAreaModal");
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

async function populateAreaDropdown() {
    let areaData = await get_area()
    const dropdown = document.getElementById("Area");
    dropdown.innerHTML = '<option value="">--Select One--</option>';

    areaData.forEach(area => {
        if (area) {
            const option = document.createElement("option");
            option.value = area.id;
            option.textContent = area.area_name;
            dropdown.appendChild(option);
        }

    });

    
}



//==========================
//Register Collector/Helper
//==========================

const addBinBtn = document.getElementById("addBtn");
const modal = document.getElementById("userModal");
const closeBtn = document.querySelector(".close-btn");
const form = modal.querySelector("#user_form");

// Open modal
addBinBtn.addEventListener("click", () => {
    modal.style.display = "block";
    document.getElementById("user_form").addEventListener("submit", (e) => {
        e.preventDefault();
        let form = document.getElementById("user_form");
        const messageBox = document.getElementById("userFormMessage");
        messageBox.textContent = "";
        messageBox.style.color = ""; 

        const formData = new FormData(form);

        const submitBtn = form.querySelector(".submit-btn");
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        fetch(`${BASE_URL}user/register/`, {
            method: 'POST',
            headers: {
                'Accept' : "*/*",
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: formData
        })
            .then(response => response.json()) 
            .then(data => {
                if (data.error) { 
                    const firstKey = Object.keys(data.error)[0];
                    const firstError = data.error[firstKey][0];
                    messageBox.textContent = firstError;
                    messageBox.style.color = "red";
                    get_user_data()

                } else {
                    messageBox.textContent = "✅ Stuff Registered successfully!";
                    messageBox.style.color = "green";
                    form.reset();
                    modal.style.display = "none";
                }
            })
            .catch(error => {
                messageBox.textContent = error
                messageBox.style.color = "red";
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerText = "Add new stuff";
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


async function get_area() {
    try {
        const response = await fetch(`${BASE_URL}area/`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            console.error("Error fetching areas:", data);
        }
    } catch (error) {
        console.error("Unexpected error while fetching areas:", error);
    }
}

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
            return data
        } else {
            console.error("Error fetching vehicles:", data);
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