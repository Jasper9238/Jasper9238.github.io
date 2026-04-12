const API_URL = "https://qrcoderbackend-gamma.vercel.app/api";

async function auth(type) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert(type === 'login' ? "Welcome back!" : "Account created!");
            localStorage.setItem('currentUser', data.username);
            window.location.href = "dashboard.html";
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        console.error(err);
        alert("Could not connect to the Python backend. Is it running?");
    }
}

