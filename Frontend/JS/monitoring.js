// Imports
import { BASE_URL } from './config.js';
import { checkUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async function () {
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
    // User Authentication
    const userData = await checkUser();
    if (!userData || userData.user_type !== 'admin') {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
        return;
    }

    // URLs
    const binUrl = `${BASE_URL}bin/`;
    const vehicleUrl = `${BASE_URL}vehicle/`;
    const areaUrl = `${BASE_URL}area/`;

    // Map Setup
    const map = L.map("map").setView([46.6895, -119.23395], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Marker Storage
    const binMarkers = {};
    const vehicleMarkers = {};
    const areaCircles = [];

    // Update Functions
    function updateBinMarker(bin) {
        if (isNaN(bin.latitude) || isNaN(bin.longitude)) {
            console.warn(`Invalid coordinates for bin ${bin.id}`);
            return;
        }

        const iconUrl = bin.color === "red"
            ? "/icons/icons8-location-35.png"
            : "/icons/icons8-location-35_green.png";

        const icon = L.icon({ iconUrl, iconSize: [30, 30], iconAnchor: [15, 30] });

        if (binMarkers[bin.id]) map.removeLayer(binMarkers[bin.id]);

        const marker = L.marker([bin.latitude, bin.longitude], { icon });
        marker.bindPopup(`🗑️ Bin ID: ${bin.id}`);
        marker.addTo(map);
        binMarkers[bin.id] = marker;
    }

    function updateVehicleMarker(vehicle) {
        if (isNaN(vehicle.latitude) || isNaN(vehicle.longitude)) {
            console.warn(`Invalid coordinates for vehicle ${vehicle.id}`);
            return;
        }

        const icon = L.icon({
            iconUrl: "/icons/icons8-pickup-35.png",
            iconSize: [35, 35],
            iconAnchor: [17, 35],
        });

        if (vehicleMarkers[vehicle.id]) map.removeLayer(vehicleMarkers[vehicle.id]);

        const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon });
        marker.bindPopup(`🚛 Vehicle ID: ${vehicle.id}<br>Status: ${vehicle.status}`);
        marker.addTo(map);
        vehicleMarkers[vehicle.id] = marker;
    }

    // Initial Fetch
    (async () => {
        try {
            const token = localStorage.getItem('access_token');
            const [binRes, vehicleRes] = await Promise.all([
                fetch(binUrl, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }),
                fetch(vehicleUrl, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }),
            ]);

            const bins = await binRes.json();
            const vehicles = await vehicleRes.json();

            bins.forEach(updateBinMarker);
            vehicles.forEach(updateVehicleMarker);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    })();

    // Area Display Checkbox Handler
    const showAreaCheckbox = document.getElementById('showAreaCheckbox');
    showAreaCheckbox.addEventListener('change', async function () {
        const token = localStorage.getItem('access_token');

        if (this.checked) {
            try {
                const res = await fetch(areaUrl, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                const areas = await res.json();

                areas.forEach(area => {
                    if (!isNaN(area.latitude) && !isNaN(area.longitude) && !isNaN(area.radius)) {
                        const circle = L.circle([area.latitude, area.longitude], {
                            color: 'blue',
                            fillColor: '#30a3ec',
                            fillOpacity: 0.4,
                            radius: area.radius,
                        }).addTo(map);
                        circle.bindPopup(`📍 ${area.area_name}`);
                        areaCircles.push(circle);
                    }
                });
            } catch (err) {
                console.error('Error fetching area data:', err);
            }
        } else {
            areaCircles.forEach(circle => map.removeLayer(circle));
            areaCircles.length = 0;
        }
    });

    // WebSocket for Realtime Updates
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/monitoring/");
    const accessToken = localStorage.getItem('access_token');

    socket.onopen = () => {
        console.log("WebSocket connected.");
        socket.send(JSON.stringify({ type: "authenticate", token: accessToken }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const message = data.message;
        console.log("Received:", message);

        if (message.bin_id !== undefined) {
            updateBinMarker(message);
        } else if (message.vehicle_id !== undefined) {
            updateVehicleMarker(message);
        }
    };

    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => console.warn("WebSocket closed.");
});

document.getElementById("logoutBtn").addEventListener('click', function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem('redirectAfterLogin')
    window.location.href = "../index.html";

})