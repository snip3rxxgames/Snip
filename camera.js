// Filename: camera.js

let JEEFACEFILTERAPI = null;
let CV = null; // internal canvas reference
let sunglassesImg = new Image();
// Placeholder image of sunglasses. You can replace this URL with a local file path.
sunglassesImg.src = "https://i.imgur.com/M6LgA7c.png"; 

let isFilterActive = false;
let isCameraRunning = false;
let canvas = document.getElementById('jeeFaceFilterCanvas');

function initCamera() {
    if (isCameraRunning) return;
    
    JEELIZFACEFILTER.init({
        canvasId: 'jeeFaceFilterCanvas',
        NNCPath: 'https://unpkg.com/jeeliz-facefilter/neuralNets/', // path to internal neural network
        callbackReady: function(errCode, spec) {
            if (errCode) {
                console.log('AN ERROR HAPPENED', errCode);
                return;
            }
            console.log('INFO: JEELIZFACEFILTER IS READY');
            isCameraRunning = true;
            CV = spec.canvasElement;
        },
        callbackTrack: function(detectState) {
            // This runs every frame
            // 1. Clear the canvas (but keep video feed underneath if using helper, usually we draw video on canvas here)
            // Note: Jeeliz draws the video frame on the canvas automatically. We just need to draw OVER it.
            
            if (detectState.detected > 0.6 && isFilterActive) {
                // Face detected!
                const face = detectState;
                
                // Get Canvas Context
                const ctx = canvas.getContext('2d');
                
                // Coordinates are -1 to 1. We need to map to pixels.
                // face.x, face.y is center of face.
                // face.s is scale (size).
                // face.ry is rotation (yaw), face.rz is rotation (roll)
                
                const x = (face.x + 1) * canvas.width / 2;
                const y = (face.y + 1) * canvas.height / 2;
                const size = face.s * canvas.width; // rough width of face
                
                // Draw Sunglasses
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(face.rz); // Rotate with head tilt
                
                // Tweaks to position glasses correctly on eyes
                const glassesWidth = size * 1.5; 
                const glassesHeight = glassesWidth * (sunglassesImg.height / sunglassesImg.width);
                
                // Offset Y slightly to sit on eyes, not center of face
                const yOffset = -size * 0.2; 
                
                ctx.drawImage(sunglassesImg, -glassesWidth/2, yOffset - glassesHeight/2, glassesWidth, glassesHeight);
                
                ctx.restore();
            }
        }
    });
}

function stopCamera() {
    if(isCameraRunning) {
        // JEELIZFACEFILTER.destroy(); // Optional: Destroys the filter instance if you want to save battery
        // For now we keep it running or you can pause it
        // isCameraRunning = false;
    }
}

function toggleSunglasses() {
    isFilterActive = !isFilterActive;
    const btn = document.getElementById('btn-sunglasses');
    if(isFilterActive) btn.classList.add('active');
    else btn.classList.remove('active');
}

function takePhoto() {
    // Capture the current state of the canvas (which includes video + sunglasses)
    const dataURL = canvas.toDataURL('image/jpeg');
    
    // Switch UI state
    document.getElementById('btn-shutter').style.display = 'none';
    document.getElementById('btn-retake').style.display = 'block';
    document.getElementById('btn-prepare-send').style.display = 'block';
    
    // Pause the engine so the image freezes
    JEELIZFACEFILTER.toggle_pause(true); 
    
    // Store image for sending
    window.currentCapturedImage = dataURL;
}

function resetCamera() {
    JEELIZFACEFILTER.toggle_pause(false); // Unpause
    document.getElementById('btn-shutter').style.display = 'flex';
    document.getElementById('btn-retake').style.display = 'none';
    document.getElementById('btn-prepare-send').style.display = 'none';
    document.getElementById('send-modal').style.display = 'none';
}

function openSendModal() {
    document.getElementById('send-modal').style.display = 'flex';
    const list = document.getElementById('send-list-el'); list.innerHTML = "";
    
    allChats.forEach(c => {
        const row = document.createElement('div'); row.className = "send-row";
        row.innerHTML = `<div class="avatar">${c.icon}</div> <span>${c.name}</span>`;
        row.onclick = () => {
            row.classList.toggle('selected');
            if(row.classList.contains('selected')) selectedSendRecipients.push(c.name);
        };
        list.appendChild(row);
    });
}

function finalizeSend() {
    if(selectedSendRecipients.length === 0) { alert("Select a friend!"); return; }
    
    selectedSendRecipients.forEach(name => {
        if(!chatData[name]) chatData[name] = [];
        chatData[name].push({
            type: "me", 
            isSnip: true, 
            image: window.currentCapturedImage, 
            text: "Sent a Snip"
        });
    });
    
    resetCamera();
    openChat(selectedSendRecipients[0]);
    document.getElementById('send-modal').style.display = 'none';
}
