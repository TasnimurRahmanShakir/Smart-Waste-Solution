import { BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
   
    // ✅ Initialize map
    const map = L.map('map').setView([23.8103, 90.4125], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let userMarker = null;
    let isFirstUpdate = true;

    // ✅ Show user’s current location
    function updateUserLocation(lat, lng) {
        if (userMarker) {
            userMarker.setLatLng([lat, lng]);
        } else {
            userMarker = L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: "../../icons/icons8-user-location-35.png",
                    iconSize: [35, 35],
                    iconAnchor: [17, 35],
                })
            }).addTo(map).bindPopup("📍 You are here").openPopup();
        }

        if (isFirstUpdate) {
            map.setView([lat, lng], 13);
            isFirstUpdate = false;
        }
    }

    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updateUserLocation(latitude, longitude);
            },
            (error) => console.error("Geolocation error:", error),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 2000 }
        );
    }

    // ✅ Fetch and show area circles
    async function renderAreas() {
        try {
            const res = await fetch(`${BASE_URL}area/`);
            const areas = await res.json();

            areas.forEach(area => {
                if (!isNaN(area.latitude) && !isNaN(area.longitude)) {
                    const circle = L.circle([area.latitude, area.longitude], {
                        color: 'green',
                        fillColor: '#3bcf3b',
                        fillOpacity: 0.3,
                        radius: 400
                    }).addTo(map);
                    circle.bindPopup(`🗺️ Area ID: ${area.id}<br>📍 Name: ${area.area_name}`);
                }
            });
        } catch (err) {
            console.error("Failed to fetch areas:", err);
        }
    }

    renderAreas();
});


