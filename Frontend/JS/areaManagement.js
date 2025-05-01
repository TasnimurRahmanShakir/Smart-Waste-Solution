import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";

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
            return data
        } else {
            console.error("Error fetching vehicles:", data);
        }
    } catch (error) {
        console.error("Unexpected error while fetching vehicles:", error);
    }
}