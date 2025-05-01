import { checkUser } from "../JS/auth.js";
import { BASE_URL } from "./config.js";

let allBins = []
document.addEventListener("DOMContentLoaded",async function () {
    let userData = await checkUser();

    if (userData.user_type !== 'admin') {
        
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html'
    }
    getBinData();

    // Event listener for search and filter
    const searchBox = document.getElementById("searchBox");
    const roleFilter = document.getElementById("roleFilter");

    searchBox.addEventListener("input", applySearchAndFilter);
    roleFilter.addEventListener("change", applySearchAndFilter);

    function applySearchAndFilter() {
        const query = searchBox.value.toLowerCase();
        const selectedRole = roleFilter.value.toLowerCase();

        const filtered = allBins.filter(bin => {
            const bin_type = `${bin.bin_type}`.toLowerCase();
            const area = (bin.area.area_name || "").toLowerCase();
            const id = String(bin.id || "").toLowerCase();


            const matchesSearch = bin_type.includes(query) || area.includes(query) || id.includes(query);
            const matchesRole = !selectedRole || bin_type === selectedRole;

            return matchesSearch && matchesRole;
        });

        renderBinTable(filtered);
    }

});


function renderBinTable(bins) {
    const tbody = document.querySelector('.table_body');
    tbody.innerHTML = '';
    bins.forEach(item => {
        const row = document.createElement('tr');
        // row.classList.add('your-class-name')

        row.innerHTML = `
                <td>${item.bin_type}</td>
                <td>${item.area.area_name}</td>
                <td>${item.capacity}</td>
                <td>${item.latitude}, ${item.longitude}</td>
                <td>${new Date(item.last_collected).toLocaleDateString()}</td>
                <td><button class="deleteBtn" value=${item.id}>Delete</button></td>
            `;

        tbody.appendChild(row);
    });
    
}
async function getBinData() {
    try {
        const response = await fetch(`${BASE_URL}bin/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        const data = await response.json();
        console.log(data);
        
        if (response.ok) {
            allBins = data
            renderBinTable(data)

        } else {
            console.error("Error fetching bin data:", data.message);
        }
    } catch (error) {
        console.error("Error fetching bin data:", error.message);
    }
}

const addBinBtn = document.getElementById("addBtn");
const modal = document.getElementById("binModal");
const closeBtn = document.querySelector(".close-btn");
const form = modal.querySelector("form");

// Open modal
addBinBtn.addEventListener("click", () => {
    modal.style.display = "block";
    document.getElementById("bin_form").addEventListener("submit", (e) => {
        e.preventDefault();
        let form = document.getElementById("bin_form");
        const messageBox = document.getElementById("binFormMessage");
        messageBox.textContent = "";
        messageBox.style.color = ""; 

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        console.log(payload);

        const submitBtn = form.querySelector(".submit-btn");
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        fetch(`${BASE_URL}bin/create/`, {
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
                    messageBox.textContent = "✅ Bin added successfully!";
                    messageBox.style.color = "green";
                    form.reset();
                    getBinData();
                    modal.style.display = "none";
                }
            })
            .catch(error => {
                messageBox.textContent = error
                messageBox.style.color = "red";
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerText = "Add Bin";
            });
;
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

// Delete Functionality:

document.querySelector('.table_body').addEventListener('click', (e) => {
    if (e.target?.classList?.contains('deleteBtn')) {
        const binId = e.target.value;
        alert(`Delete button clicked for bin with ID: ${binId}`);
        const messageBox = document.getElementById('messageBox');


        fetch(`${BASE_URL}bin/delete/${binId}/`, {
            method: 'DELETE',
            headers: {
                'authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(response => {
                messageBox.style.display = 'block';
                if (response.ok) {
                    if (response.status === 204) {
                        messageBox.textContent = '✅ Bin deleted successfully!';
                        messageBox.className = 'message-box success';
                        getBinData();
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
