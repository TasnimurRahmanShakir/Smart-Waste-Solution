import { BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () { 
    const loginForm = document.getElementById("login_form");
    const loginButton = document.getElementById("login_button");

    // localStorage.removeItem('redirectAfterLogin')


    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent the form from submitting the default way

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        console.log(email, password);
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        try {
            const response = await fetch(`${BASE_URL}user/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert('Login failed');
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();
            console.log(data)
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            
            if (data.user.user_type === 'admin') {
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    console.log(redirectUrl)
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    console.log(window.location.href)
                    window.location.href = './admin/adminHome.html';
                }
            }
            else if (data.user.user_type === 'citizen') {
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    console.log(redirectUrl)
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    console.log(window.location.href)
                    window.location.href = '../Citizen/citizenHome.html';
                }
            } else if (data.user.user_type === 'collector') {
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    console.log(redirectUrl)
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    console.log(window.location.href)
                    window.location.href = '../Collector/collectorHome.html';
                }
            }
            
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
    });
})
