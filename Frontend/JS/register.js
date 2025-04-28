async function checkUserType() {
    try {
        const accessToken = localStorage.getItem('access');
        if (!accessToken) return; // No user logged in

        const response = await fetch('http://your-api-url.com/api/user/profile/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        const userData = await response.json();
        const userType = userData.user_type;  // Adjust based on your backend response

        if (userType === 'admin') {
            document.getElementById('userTypeSection').style.display = 'block';
        } else {
            document.getElementById('userTypeSection').style.display = 'none';
        }
    } catch (error) {
        console.error(error);
        document.getElementById('userTypeSection').style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", checkUserType);
