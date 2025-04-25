async function login() {
    const url = 'http://127.0.0.1:8000/api/user/login/';  // Your login API endpoint
    
    const data = {
        email: 'tasnim.bd.cse@gmail.com',  // your email
        password: '123456'                 // your password
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Login successful!');
            console.log('Access Token:', result.access);
            console.log('Refresh Token:', result.refresh);
            console.log('User Info:', result.user);

            // Call the WebSocket function with the access token
            connectToWebSocket(result.access);

        } else {
            console.error('Login failed:', result);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function connectToWebSocket(accessToken) {
    let socket = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/`);

    socket.onopen = function (event) {
        console.log("WebSocket connected!");

        // After connection, send token
        
        socket.send(JSON.stringify({
            "type": "authenticate",
            "token": accessToken
        }));
    };

    socket.onmessage = function (event) {
        let data = JSON.parse(event.data);
        console.log("New Notification:", data.message);
    };

    socket.onclose = function (event) {
        console.log("WebSocket disconnected.");
    };

    socket.onerror = function (error) {
        console.log("WebSocket error:", error);
    };

}

// Call the login function to test
login();
