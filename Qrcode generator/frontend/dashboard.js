const WORKER_URL = "https://qr-generator-backend.jasperhung887.workers.dev"; 
const PYTHON_URL = "https://qrcoderbackend-gamma.vercel.app/api";
const user = localStorage.getItem('currentUser');

if (!user) {
    window.location.href = "index.html"; 
}

async function generateQR() {
    const targetUrl = document.getElementById('targetUrl').value;
    const WORKER_URL = "https://qr-generator-backend.jasperhung887.workers.dev/"; 
    const PYTHON_URL = "https://qrcoderbackend-gamma.vercel.app/api";

  
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
    const PYTHON_URL = "https://qrcoderbackend-gamma.vercel.app/api";
    const WORKER_URL = "https://qr-generator-backend.jasperhung887.workers.dev/"; 

    // Match the route name we created in Python: /my-qrs
    const res = await fetch(`${PYTHON_URL}/my-qrs?username=${user}`);
    const data = await res.json();

    const grid = document.getElementById('qr-grid');
    grid.innerHTML = ''; 

    if (data.success) {
        data.qrs.forEach(qr => {
            const fullLink = `${WORKER_URL}/${qr.token}`;
            grid.innerHTML += `
                <div class="qr-card">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullLink)}&size=150x150" alt="QR Code">
                    <p><strong>Token:</strong> ${qr.token}</p>
                    <p><strong>Target:</strong> ${qr.target_url}</p> <p><strong>Clicks:</strong> ${qr.clicks}</p>
                    <a href="${fullLink}" target="_blank">Test Link</a>
                </div>
            `;
        });
    }
}

// Call this when the page opens
loadMyQRs();