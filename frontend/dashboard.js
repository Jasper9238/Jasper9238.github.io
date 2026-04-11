const WORKER_URL = "http://127.0.0.1:8787/"; 
const PYTHON_URL = "http://127.0.0.1:5000/api";
const user = localStorage.getItem('currentUser');

if (!user) {
    window.location.href = "index.html"; 
}

async function generateQR() {
    const targetUrl = document.getElementById('targetUrl').value;
    const WORKER_URL = "http://127.0.0.1:8787"; 
    const PYTHON_URL = "http://127.0.0.1:5000/api";

  
    const wRes = await fetch(`${WORKER_URL}/v1/qrcode/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl })
    });
    const wData = await wRes.json();
    

    if (wData.success) {
        await fetch(`${PYTHON_URL}/save-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: localStorage.getItem('currentUser'),
                token: wData.token,
                target: targetUrl
            })
        });
        alert("Generated and Saved!");
        location.reload();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = "index.html";
}
async function loadMyQRs() {
    const user = localStorage.getItem('currentUser');
    const PYTHON_URL = "http://127.0.0.1:5000/api";
    const WORKER_URL = "http://127.0.0.1:8787"; 

    const res = await fetch(`${PYTHON_URL}/get-history?username=${user}`);
    const data = await res.json();

    const grid = document.getElementById('qr-grid');
    grid.innerHTML = ''; 

    data.qrs.forEach(qr => {
        console.log('debug')
        const fullLink = `${WORKER_URL}/${qr.token}`;
        grid.innerHTML += `
            <div class="qr-card">
                <img src="https://api.qrserver.com/v1/create-qr-code/?data=${fullLink}&size=150x150" alt="QR Code">
                <p><strong>Token:</strong> ${qr.token}</p>
                <p><strong>Target:</strong> ${qr.target}</p>
                <a href="${fullLink}" target="_blank">Test Link</a>
            </div>
        `;
    });
}

// Call this when the page opens
loadMyQRs();