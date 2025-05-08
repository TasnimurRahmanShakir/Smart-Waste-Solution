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
    if (userData.user_type !== 'citizen') {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = '../login.html';
        return;
    }




    // Map Setup
    const map = L.map('map').setView([23.8103, 90.4125], 13);  // Dhaka, Bangladesh
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    const binMarkers = {};
    let routingControl = null;
    let allBins = [];
    let userMarker = null;
    let isFirstUpdate = true;


    function updateRoute(vehicleLat, vehicleLng, bins) {
        console.log(bins);

        

        // Clear previous route
        if (routingControl) {
            map.removeControl(routingControl);
        }

        const waypoints = [
            L.latLng(vehicleLat, vehicleLng),
            ...bins.map(bin => {
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
                    { color: 'blue', weight: 4, opacity: 0.7 }
                ]
            }
        }).addTo(map);
    }


    function sendLocation(lat, lng) {
        console.log(lat, lng);

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
        const binUrl = `${BASE_URL}bin?latitude=${lat}&longitude=${lng}`;
        const token = localStorage.getItem('access_token');
        fetch(binUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                updateRoute(lat, lng, data);
            })
            .catch(err => {
                console.error("Location update failed", err);
            });
        

        


    }

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

});
