import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";

let allArea = []

document.addEventListener("DOMContentLoaded", async function () {
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
    get_area();

    // Event listener for search and filter
    const searchBox = document.getElementById("searchBox");

    searchBox.addEventListener("input", applySearchAndFilter);

    function applySearchAndFilter() {
        const query = searchBox.value.toLowerCase();

        const filtered = allArea.filter(area => {
            const name = `${area.area_name}`.toLowerCase();
            const id = String(area.id || "").toLowerCase();


            const matchesSearch = name.includes(query) || id.includes(query);

            return matchesSearch;
        });

        renderBinTable(filtered);
    }

});

export async function get_area() {
    try {
        const response = await fetch(`${BASE_URL}area/`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const data = await response.json();
        console.log('Area', data)
        if (response.ok) {
            allArea = data
            renderBinTable(data)
            return data
        } else {
            console.error("Error fetching vehicles:", data);
        }
    } catch (error) {
        console.error("Unexpected error while fetching vehicles:", error);
    }
}

function renderBinTable(areas) {
    const tbody = document.querySelector('.table_body');
    tbody.innerHTML = '';
    areas.forEach(item => {
        const row = document.createElement('tr');
        // row.classList.add('your-class-name')

        row.innerHTML = `
                <td>${item.area_name}</td>
                <td>${item.latitude}, ${item.longitude}</td>
                <td>${item.radius}</td>
                <td><button class="deleteBtn" value=${item.id}>Delete</button></td>
            `;

        tbody.appendChild(row);
    });

}


const addBinBtn = document.getElementById("addBtn");
const modal = document.getElementById("areaModal");
const closeBtn = document.querySelector(".close-btn");
const form = modal.querySelector("form");

// Open modal
addBinBtn.addEventListener("click", () => {
    modal.style.display = "block";
    document.getElementById("area_form").addEventListener("submit", (e) => {
        e.preventDefault();
        let form = document.getElementById("area_form");
        const messageBox = document.getElementById("areaFormMessage");
        messageBox.textContent = "";
        messageBox.style.color = ""; 

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        console.log(payload);

        const submitBtn = form.querySelector(".submit-btn");
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        fetch(`${BASE_URL}area/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json()) 
            .then(data => {
                if (data.error) { 
                    messageBox.textContent = data.error;
                    messageBox.style.color = "red";
                } else {
                    messageBox.textContent = "✅ Area added successfully!";
                    messageBox.style.color = "green";
                    form.reset();
                    get_area();
                    modal.style.display = "none";
                }
            })
            .catch(error => {
                messageBox.textContent = error
                messageBox.style.color = "red";
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerText = "Add Area";
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

// Delete Functionality

document.querySelector('.table_body').addEventListener('click', (e) => {
    if (e.target?.classList?.contains('deleteBtn')) {
        const binId = e.target.value;
        alert(`Delete button clicked for bin with ID: ${binId}`);
        const messageBox = document.getElementById('messageBox');


        fetch(`${BASE_URL}area/delete/${binId}/`, {
            method: 'DELETE',
            headers: {
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(response => {
                messageBox.style.display = 'block';
                if (response.ok) {
                    if (response.status === 204) {
                        messageBox.textContent = '✅ Area deleted successfully!';
                        messageBox.className = 'message-box success';
                        get_area();
                    }
                } else {
                    return response.json(); 
                }
            })
            .then(data => {
                if (data) { 
                    messageBox.style.display = 'block';
                    messageBox.textContent = `❌ Error deleting bin: ${data.error || 'Unknown error'}`;
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

document.getElementById("logoutBtn").addEventListener('click', function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem('redirectAfterLogin')
    window.location.href = "../index.html";

})