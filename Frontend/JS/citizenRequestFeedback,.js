// Your existing imports
import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";

let allRequest = [];
let userId
document.addEventListener("DOMContentLoaded", async function () {
    // Nav and sidebar toggles
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

    let userData = await checkUser();
    userId = userData.id
    if (!userData || userData.user_type !== 'citizen') {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
        return;
    }

    get_request_feedback();
});

// Fetch requests
async function get_request_feedback() {
    try {
        const response = await fetch(`${BASE_URL}requestFeedback/`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            allRequest = data;
            renderRequestTable(data);
        } else {
            console.error("Error fetching request feedback:", data);
        }
    } catch (error) {
        console.error("Unexpected error:", error);
    }
}

// Render table
function renderRequestTable(requests) {
    const tbody = document.querySelector('.table_body');
    tbody.innerHTML = '';

    requests.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${item.request_type || 'Not applicable'}</td>
            <td>${item.message || 'Not applicable'}</td>
            <td>${item.created_at ? new Date(item.created_at).toLocaleString() : 'Not applicable'}</td>
            <td>${item.status || 'Not applicable'}</td>
        `;

        tbody.appendChild(row);
    });
}

// Modal controls
const requestModal = document.getElementById("requestModal");
const addBtn = document.getElementById("addBtn");
const closeBtn = document.querySelector(".close-btn");

addBtn.addEventListener("click", () => {
    requestModal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    requestModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === requestModal) {
        requestModal.style.display = "none";
    }
});

// Dynamic form field for bin ID
document.getElementById("requestType").addEventListener("change", function () {
    const binGroup = document.getElementById("binIdGroup");
    const statusField = document.getElementById("status");
    const selected = this.value;

    if (selected === "collection_request" || selected === "bin") {
        binGroup.style.display = "block";
    } else {
        binGroup.style.display = "none";
        document.getElementById("binId").value = "";
    }

    // Set default status for request types that require it
    if (selected === "collection_request" || selected === "bin") {
        statusField.value = "pending";
    } else {
        statusField.value = "";
    }
});

// Submit form
document.getElementById("request_form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const messageBox = document.getElementById("requestFormMessage");
    messageBox.textContent = "";
    messageBox.style.color = "";

    const formData = new FormData(this);
    const payload = Object.fromEntries(formData.entries());
    payload.requested_by = userId;
    if (payload.request_type !== "collection_request" && payload.request_type !== "bin") {
        payload.status = null;
    }


    const submitBtn = this.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    console.log(payload)
    try {
        const response = await fetch(`${BASE_URL}requestFeedback/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },

            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.textContent = "✅ Submitted successfully!";
            messageBox.style.color = "green";
            this.reset();
            get_request_feedback();
            requestModal.style.display = "none";
        } else {
            messageBox.textContent = data.error || "Failed to submit.";
            messageBox.style.color = "red";
        }
    } catch (err) {
        messageBox.textContent = err.message || "An error occurred.";
        messageBox.style.color = "red";
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit";
    }
});

document.getElementById("logoutBtn").addEventListener('click', function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem('redirectAfterLogin')
    window.location.href = "../index.html";

})