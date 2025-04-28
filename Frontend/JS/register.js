async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
        window.location.href = "../login.html";
        return;
    }

    console.log("Refreshing access token...");
    console.log("Refresh token:", refreshToken);
    try {
        const response = await fetch(`${BASE_URL}token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Refresh token expired");
        }

        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        return data.access;
    } catch (error) {
        console.error("Refresh token error:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_type");
        window.location.href = "/login.html"; // Redirect to login
    }
}

let accessToken = localStorage.getItem("access_token");
const refreshToken = localStorage.getItem("refresh_token");

if (!accessToken && !refreshToken) {
    // No user logged in
    document.getElementById("userTypeSection").style.display = "none";
    return;
}

// Try fetching user info
let response = await fetch(`${BASE_URL}user/profile/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
});

if (response.status === 401) {
    // Access token expired, try refreshing
    accessToken = await refreshAccessToken();
    if (!accessToken) return;

    response = await fetch(`${BASE_URL}user/profile/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

if (response.ok) {
    const userData = await response.json();
    const userType = userData.user_type; // Adjust field based on your backend

    if (userType === "admin") {
        // Admin logged in => show User Type selection
        document.getElementById("userTypeSection").style.display = "block";
    } else {
        // Citizen or collector logged in => not allowed
        alert("You are not allowed to register new users.");
        window.location.href = "/some-dashboard.html"; // redirect to dashboard
    }
} else {
    console.error("Failed to fetch user");
    document.getElementById("userTypeSection").style.display = "none";
}

document.addEventListener("DOMContentLoaded", checkUser);
