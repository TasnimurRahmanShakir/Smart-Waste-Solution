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
    if (userData.user_type !== 'collector') {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
        return;
    }


    const vehicleUrl = `${BASE_URL}vehicle/`;
    const binUrl = `${BASE_URL}schedule/`;
    const locationUpdateUrl = `${BASE_URL}vehicle/locationUpdate/`;

    // Map Setup
    const map = L.map('map').setView([23.8103, 90.4125], 13);  // Dhaka, Bangladesh
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    const binMarkers = {};
    const vehicleMarkers = {};
    let routingControl = null;
    const allBins = new Set();
    let userMarker = null; 
    let isFirstUpdate = true;


    function updateRoute(vehicleLat, vehicleLng, bins) {
        console.log(bins); 

        const binsArray = Array.isArray(bins) ? bins : Array.from(bins);


        // Clear previous route
        if (routingControl) {
            map.removeControl(routingControl);
        }

        const waypoints = [
            L.latLng(vehicleLat, vehicleLng),
            ...binsArray.map(bin => { 
                if (bin.latitude && bin.longitude) {
                    console.log(bin.latitude, bin.longitude);
                    return L.latLng(bin.latitude, bin.longitude);
                }
            }).filter(Boolean)
        ];


        if (waypoints.length <= 1) return;

        routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            addWaypoints: false,
            fitSelectedRoutes: false,
            show: false,
            lineOptions: {
                styles: [
                    { color: 'blue', weight: 4, opacity: 0.7 } // Customizing the route line
                ]
            }
        }).addTo(map);
    }





    // ✅ 3. Send collector location to backend and update map
    function sendLocation(lat, lng) {
        console.log(lat, lng);

        // 🔥 Update or create marker on map
        if (userMarker) {
            userMarker.setLatLng([lat, lng]);
        } else {
            userMarker = L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: "../../icons/icons8-pickup-35.png",
                    iconSize: [35, 35],
                    iconAnchor: [17, 35],
                })
            }).addTo(map).bindPopup("📍 You are here");
        }

        if (isFirstUpdate) {
            map.setView([lat, lng], 13);
            isFirstUpdate = false;
        }
        updateRoute(lat, lng, allBins);

        // Send location to backend (uncomment when needed)
        const token = localStorage.getItem('access_token');
        fetch(locationUpdateUrl, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ latitude: lat, longitude: lng }),
        }).catch(err => console.error("Location update failed", err));
    }

    // ✅ 4. Get and send geolocation continuously
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                sendLocation(latitude, longitude);
            },
            (error) => {
                console.error("Geolocation error:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 2000,
            }
        );
    }

    // ✅ 5. Modify updateBinMarker to respect assigned/emergency
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
        marker.bindPopup(`🚛 License No: ${vehicle.license_no}<br>Status: ${vehicle.status}`);
        marker.addTo(map);
        vehicleMarkers[vehicle.id] = marker;
    }

    // ✅ 6. Wait for filters then render


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

            const binData = await binRes.json();
            binData.forEach(schedule => {
                if (schedule.status === 'ongoing') {
                    schedule.bins.forEach(binId => allBins.add(binId));
                }
            });
            const vehicle = await vehicleRes.json();
            allBins.forEach(updateBinMarker);
            updateVehicleMarker(vehicle);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    })();
});

document.getElementById("logoutBtn").addEventListener('click', function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "../index.html";

})