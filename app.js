// Filename: app.js

// --- DATA ---
let chatData = {
    "Roomies": [],
    "Alex": [{ type: "friend", text: "Yo, check out the new filter", time: "2h ago", reaction: null }]
};
let allChats = [{name: "Roomies", icon: "🏠"}, {name: "Alex", icon: "🎮"}];
let activeChatID = null;
let selectedSendRecipients = [];

// --- VIEW SWITCHER ---
function switchView(view) {
    document.getElementById('view-chat').style.display = 'none';
    document.getElementById('view-camera').style.display = 'none';
    document.getElementById('view-snips').style.display = 'none';
    document.getElementById('view-empty').style.display = 'none';
    
    // Stop camera if leaving camera view
    if(view !== 'camera' && window.stopCamera) window.stopCamera();

    if(view === 'chat') {
        if(activeChatID) document.getElementById('view-chat').style.display = 'flex';
        else document.getElementById('view-empty').style.display = 'flex';
        renderSidebar();
    }
    if(view === 'camera') {
        document.getElementById('view-camera').style.display = 'block';
        if(window.initCamera) window.initCamera(); // Call function in camera.js
    }
    if(view === 'snips') {
        document.getElementById('view-snips').style.display = 'flex';
    }
}

// --- CHAT LOGIC ---
function renderSidebar() {
    const el = document.getElementById('chat-list-el'); el.innerHTML = "";
    allChats.forEach(c => {
        const div = document.createElement('div');
        div.className = `chat-item ${activeChatID===c.name?'active':''}`;
        div.onclick = () => openChat(c.name);
        div.innerHTML = `<div class="avatar">${c.icon}</div><div class="chat-info"><div class="chat-name">${c.name}</div></div>`;
        el.appendChild(div);
    });
}

function openChat(name) {
    activeChatID = name; 
    switchView('chat');
    document.getElementById('active-chat-name').innerText = name;
    const con = document.getElementById('messages-container'); 
    con.innerHTML = "";
    const msgs = chatData[name]||[];
    
    msgs.forEach((msg, i) => {
        const row = document.createElement('div'); 
        row.className = `msg-row ${msg.type}`;
        
        // Reaction Trigger Logic
        if (msg.type === 'friend') {
            const trigger = document.createElement('div');
            trigger.className = 'reaction-trigger';
            trigger.innerHTML = '<i class="far fa-smile"></i>';
            trigger.onclick = (e) => { e.stopPropagation(); alert('Reaction menu would open here'); };
            row.appendChild(trigger);
        }

        let bubbleHtml = `<div class="bubble-text">${msg.text}</div>`;
        if (msg.isSnip) {
            bubbleHtml = `<div class="bubble-text" style="background:#111; border:1px solid #444; cursor:pointer;" onclick="viewSnip('${msg.image}')">📸 New Snip</div>`;
        }
        
        row.innerHTML += bubbleHtml;
        if(msg.reaction) row.innerHTML += `<div class="reaction-badge">${msg.reaction}</div>`;
        con.appendChild(row);
    });
}

function checkSend(e) {
    if(e.key === 'Enter' && activeChatID) {
        if(!chatData[activeChatID]) chatData[activeChatID] = [];
        chatData[activeChatID].push({type:"me", text:e.target.value});
        e.target.value = ""; 
        openChat(activeChatID);
    }
}

function viewSnip(img) {
    document.getElementById('fs-image').src = img;
    document.getElementById('fullscreen-snip-viewer').style.display = 'flex';
}
function closeFullscreenSnip() { document.getElementById('fullscreen-snip-viewer').style.display = 'none'; }
