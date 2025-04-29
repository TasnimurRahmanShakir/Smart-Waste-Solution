import { BASE_URL } from "./config.js";
import { checkUser } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    initializePasswordValidation();
    registerUser();
});

async function verification() {
    let accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
        document.getElementById('userTypeSection').style.display = 'none';
        return;
    }

    const userData = await checkUser();
    if (!userData) {
        console.log("User data not found, Please login/register a new account.");
        document.getElementById('userTypeSection').style.display = 'none';
        return;
    }

    const userType = userData.user_type;
    console.log("User type:", userType);
    if (userType === 'admin') {
        document.getElementById('userTypeSection').style.display = 'block';

    } else if (userType === 'collector') {
        //go to collector dashboard
    } else if (userType === 'citizen') {
        //go to citizen dashboard
        console.log("Logout first to register a new account.");
        document.getElementById('userTypeSection').style.display = 'none';
    } else {
        console.log("Invalid user type:", userType);
        document.getElementById('userTypeSection').style.display = 'none';
    }





}


function initializePasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm_password');
    const errors = {
        length: document.getElementById('length-error'),
        letter: document.getElementById('letter-error'),
        digit: document.getElementById('digit-error'),
        symbol: document.getElementById('symbol-error'),
        match: document.getElementById('match-error')
    };

    passwordInput.addEventListener('input', validatePassword);
    confirmInput.addEventListener('input', validatePasswordMatch);

    function validatePassword() {
        const password = passwordInput.value;
        const hasMinLength = password.length >= 6;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        // Update error messages
        toggleError(errors.length, hasMinLength);
        toggleError(errors.letter, hasLetter);
        toggleError(errors.digit, hasDigit);
        toggleError(errors.symbol, hasSymbol);

        // Update input border
        passwordInput.classList.toggle('valid', hasMinLength && hasLetter && hasDigit && hasSymbol);
        passwordInput.classList.toggle('invalid', !(hasMinLength && hasLetter && hasDigit && hasSymbol));
    }

    function validatePasswordMatch() {
        const match = passwordInput.value === confirmInput.value;
        toggleError(errors.match, match);
        confirmInput.classList.toggle('valid', match);
        confirmInput.classList.toggle('invalid', !match);
    }

    function toggleError(element, isValid) {
        element.style.display = isValid ? 'none' : 'block';
        element.innerHTML = isValid ? `✓ ${element.innerText.slice(2)}` : element.innerHTML;
        element.classList.toggle('valid', isValid);
    }
}

async function registerUser() {
    await verification();

    const registerForm = document.getElementById("register_form");
    const userTypeSection = document.getElementById('userTypeSection');

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Check password validity before submission
        const passwordValid = validatePasswordStrength();
        const passwordsMatch = document.getElementById('confirm_password').classList.contains('valid');

        if (!passwordValid || !passwordsMatch) {
            alert('Please fix password errors before submitting!');
            return;
        }

        const registerData = new FormData(this);

        if (userTypeSection.style.display !== 'none') {
            const userType = document.querySelector('input[name="user_type"]:checked')?.value;
            if (userType) registerData.append('user_type', userType);
        }


        try {
            const response = await fetch(`${BASE_URL}user/register/`, {
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                },
                body: registerData,
            });
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error("JSON parsing error:", jsonError);
                throw new Error("Invalid JSON in response");
            }
            if (!response.ok) {
                alert(data.message || "Registration failed.");
                return;
            }
            alert("Registration successful! Please log in.");
            window.location.href = "login.html";

        } catch (error) {
            console.error('Registration error:', error);
            alert(`Error: ${error.message}`);
        }
    });
}

function validatePasswordStrength() {
    const password = document.getElementById('password').value;
    return (
        password.length >= 6 &&
        /[a-zA-Z]/.test(password) &&
        /\d/.test(password) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
}


