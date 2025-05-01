import { BASE_URL } from "./config.js";
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

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
        return null;
    }
}

export async function checkUser() { 
    let accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    console.log("Access token:", accessToken);
    console.log("Refresh token:", refreshToken);

    let response;
    try {
        response = await fetch(`${BASE_URL}user/profile/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.status === 403) {
            accessToken = await refreshAccessToken();
            if (!accessToken) return;

            response = await fetch(`${BASE_URL}user/profile/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        }

        if (response.ok) {
            const userData = await response.json();
            return userData
        } else {
            console.error('Failed to fetch user');
        }
    } catch (error) {
        console.error('Error checking user:', error);
    }
}