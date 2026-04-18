const WORKER_URL = "https://qr-generator-backend.jasperhung887.workers.dev"; 
const PYTHON_URL = "https://qrcoderbackend-gamma.vercel.app/api";
const user = localStorage.getItem('currentUser');

if (!user) {
    window.location.href = "index.html"; 
}

async function generateQR() {
    const targetUrl = document.getElementById('targetUrl').value;
    const WORKER_URL = "https://qr-generator-backend.jasperhung887.workers.dev"; 
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
    const res = await fetch(`${PYTHON_URL}/my-qrs?username=${user}`);
    const data = await res.json();

    const grid = document.getElementById('qr-grid');
    grid.innerHTML = ''; 

    if (data.success) {
        // High-efficiency tip: build one big string instead of many innerHTML += calls
        let htmlContent = '';
        
        data.qrs.forEach(qr => {
            const fullLink = `${WORKER_URL}/${qr.token}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullLink)}&size=300x300`;
            
            htmlContent += `
                <div class="qr-card">
                    <img src="${qrImageUrl.replace('size=300x300', 'size=150x150')}" alt="QR Code">
                    <p><strong>Token:</strong> ${qr.token}</p>
                    <p><strong>Clicks:</strong> ${qr.clicks}</p>
                    <div class="card-actions">
                        <a href="${fullLink}" target="_blank" class="btn-test">Test</a>
                        <button onclick="downloadQR('${qrImageUrl}', 'qr-${qr.token}.png')" class="btn-download">
                            Download
                        </button>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = htmlContent;
    }
}
async function downloadQR(url, filename) {
    try {
        // 1. Fetch the image data
        const response = await fetch(url);
        const blob = await response.blob();
        
        // 2. Create a temporary 'virtual' link
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = blobUrl;
        link.download = filename;
        
        // 3. Programmatically click it to trigger download
        document.body.appendChild(link);
        link.click();
        
        // 4. Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download image. Check your internet connection.");
    }
}
// Call this when the page opens
loadMyQRs();