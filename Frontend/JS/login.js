import { BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () { 
    const loginForm = document.getElementById("login_form");
    const loginButton = document.getElementById("login_button");
    // const loginError = document.getElementById("login_error");

    console.log(loginForm);
    console.log(loginButton);

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
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            if (data.user.user_type === 'admin') {
                console.log('Admin login successful!');
            }
            else if (data.user.user_type === 'citizen') {
                console.log('Citizen login successful!');
            } else {
                console.log("Collector login successful!");
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
