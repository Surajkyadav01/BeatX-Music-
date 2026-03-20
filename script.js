const firebaseConfig = {
    apiKey: "AIzaSyDZyW--xOpLP3b5Ibsx4-xzYPKH5ybkx94",
    authDomain: "sonicx-music.firebaseapp.com",
    projectId: "sonicx-music",
    storageBucket: "sonicx-music.firebasestorage.app",
    messagingSenderId: "785637688246",
    appId: "1:785637688246:web:9fe935203c3619cde8b717"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- DOM Elements ---
const audio = document.getElementById('audioElement');
const masterPlay = document.getElementById('masterPlay');
const fullMasterPlay = document.getElementById('fullMasterPlay'); // Naya element
const progressBar = document.getElementById('progressBar');
const fullProgressBar = document.getElementById('fullProgressBar'); // Naya element
const progressContainer = document.querySelector('.progress-container');
const adminPassword = "Sunil";

let allSongs = [];
let currentSongIndex = -1;
let deleteMode = false;
let searchTimer; 

const myFixedSongs = [
    { name: 'Teri Hogaiyaan', artist: 'Vishal Mishra', img: 'https://image2url.com/r2/default/images/1773862409110-24818e4e-59f9-486e-a461-b4f420786bf9.jpg', url: 'https://image2url.com/r2/default/audio/1773862358460-04c98278-5f8a-42eb-84fc-5a2725949623.mp3' },
    { name: 'Phir Bhi Tumko Chaahunga', artist: 'Arijit Singh', img: 'https://image2url.com/r2/default/images/1773863572773-8f31b0fb-71b0-4e9d-b91d-2fa1d7e33b1c.jpg', url: 'https://image2url.com/r2/default/audio/1773863766875-ff5a1da7-fa34-4a22-8bd8-8e97c524237e.mp3' },
    { name: 'Sanson Ki Mala', artist: 'Rahat Fateh Ali Khan', img: 'https://image2url.com/r2/default/images/1773866445142-a5076e4b-a813-4553-9de7-72170dc2c85f.jpg', url: 'https://image2url.com/r2/default/audio/1773866292593-eeb5fc72-d3b0-4e77-9a8d-0c3076fec763.mp3' },
    { name: 'Chaap Tilak', artist: 'Nakash Aziz', img: 'https://image2url.com/r2/default/images/1773866751399-f93751a0-62b4-4dd4-811d-3f02024650f4.jpg', url: 'https://image2url.com/r2/default/audio/1773866515382-37a07c64-a3a1-40e4-a311-a97cba1f50f1.mp3' },
    { name: 'Sukoon', artist: 'Arijit Singh', img: 'https://image2url.com/r2/default/images/1773914133996-4f05ec84-8944-4d10-8565-635d99213067.jpg', url: 'https://image2url.com/r2/default/audio/1773913962606-27f9484e-9948-4ef9-9969-e93fd31a0208.mp3' }
];

// --- Audio Controls ---
function playSong(url, title, artist, img) {
    document.getElementById('mainPlayer').style.display = 'block';
    audio.src = url;
    audio.play();

    // Mini Player Update
    document.getElementById('player-title').innerText = title + " • " + artist;
    document.getElementById('player-img').src = img;
    masterPlay.classList.replace('fa-play', 'fa-pause');

    // Full Player Update (Dhyan se dekhiye, yahan image badi dikhegi)
    document.getElementById('full-player-img').src = img;
    document.getElementById('full-player-title').innerText = title;
    document.getElementById('full-player-artist').innerText = artist;
    if(fullMasterPlay) fullMasterPlay.classList.replace('fa-play-circle', 'fa-pause-circle');

    currentSongIndex = allSongs.findIndex(s => s.url === url);
}

// Expand & Minimize Functions
function expandPlayer() {
    document.getElementById('fullPlayer').classList.add('active');
}

function minimizePlayer() {
    document.getElementById('fullPlayer').classList.remove('active');
}

// Next & Previous Logic
function nextSong() {
    if (currentSongIndex < allSongs.length - 1) {
        currentSongIndex++;
        let s = allSongs[currentSongIndex];
        playSong(s.url, s.name, s.artist, s.img);
    }
}

function prevSong() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
        let s = allSongs[currentSongIndex];
        playSong(s.url, s.name, s.artist, s.img);
    }
}

audio.onended = () => {
    nextSong(); // Auto-play next song
};

// Seek logic for Mini Player
progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
});

// Seek logic for Full Player (Skip logic)
function seekAudioFull(e) {
    const rect = document.querySelector('.full-progress-container').getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * audio.duration;
}

// Syncing both Progress Bars & Time
audio.ontimeupdate = () => {
    if (audio.duration) {
        let percent = (audio.currentTime / audio.duration) * 100;
        
        // Mini Bar
        if(progressBar) progressBar.style.width = percent + "%";
        
        // Full Bar
        if(fullProgressBar) fullProgressBar.style.width = percent + "%";

        // Time Update
        document.getElementById('currentTime').innerText = formatTime(audio.currentTime);
        document.getElementById('totalDuration').innerText = formatTime(audio.duration);
    }
};

function formatTime(sec) {
    let min = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return `${min}:${s < 10 ? '0' + s : s}`;
}

function togglePlay() {
    if (audio.paused) { 
        audio.play(); 
        masterPlay.classList.replace('fa-play', 'fa-pause'); 
        if(fullMasterPlay) fullMasterPlay.classList.replace('fa-play-circle', 'fa-pause-circle');
    } else { 
        audio.pause(); 
        masterPlay.classList.replace('fa-pause', 'fa-play'); 
        if(fullMasterPlay) fullMasterPlay.classList.replace('fa-pause-circle', 'fa-play-circle');
    }
}

// --- Admin & Delete Features (No Changes Here) ---
function askPassword() { document.getElementById('passwordOverlay').style.display = 'flex'; }
function closePopups() { document.getElementById('passwordOverlay').style.display = 'none'; document.getElementById('createOverlay').style.display = 'none'; }

function verifyPassword() {
    if (document.getElementById('passInput').value === adminPassword) {
        document.getElementById('passwordOverlay').style.display = 'none';
        document.getElementById('createOverlay').style.display = 'flex';
    } else { alert("Galat Password!"); }
}

function toggleDeleteMode() {
    deleteMode = !deleteMode;
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.style.display = deleteMode ? 'block' : 'none';
    });
    alert(deleteMode ? "Delete Mode ON!" : "Delete Mode OFF.");
    closePopups();
}

function deleteSong(docId, event) {
    event.stopPropagation();
    if (confirm("Delete from Cloud?")) {
        db.collection("songs").doc(docId).delete().then(() => {
            alert("Gaana mit gaya!");
        });
    }
}

function saveToCloud() {
    const name = document.getElementById('cName').value;
    const artist = document.getElementById('cArtist').value;
    const img = document.getElementById('cImg').value;
    const url = document.getElementById('cUrl').value;
    if (!name || !artist || !img || !url) return alert("Fill all!");

    db.collection("songs").add({ 
        name, artist, img, url, timestamp: firebase.firestore.FieldValue.serverTimestamp() 
    }).then(() => { closePopups(); });
}

// --- UI Rendering ---
function cardHtml(s, docId = null) {
    const delBtn = docId ? `<span class="delete-btn" onclick="deleteSong('${docId}', event)"><i class="fas fa-trash"></i></span>` : "";
    const sName = s.name.replace(/'/g, "\\'");
    const sArtist = s.artist.replace(/'/g, "\\'");
    const sUrl = s.url.replace(/'/g, "\\'");

    return `
    <div class="mini-card" onclick="playSong('${sUrl}', '${sName}', '${sArtist}', '${s.img}')">
        ${delBtn}
        <img src="${s.img}">
        <div class="card-text">
            <span>${s.name}</span>
            <small><span class="singer-label">Singer:</span> <span class="artist-name">${s.artist}</span></small>
        </div>
    </div>`;
}

function loadContent() {
    document.getElementById('favGrid').innerHTML = myFixedSongs.slice(0, 2).map(s => cardHtml(s)).join('');
    document.getElementById('recommendedGrid').innerHTML = myFixedSongs.slice(2, 4).map(s => cardHtml(s)).join('');
    
    db.collection("songs").orderBy("timestamp", "desc").onSnapshot(snap => {
        const cloudGrid = document.getElementById('cloudGrid');
        const cloudSongs = snap.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
        allSongs = [...myFixedSongs, ...cloudSongs];

        if (snap.empty) {
            cloudGrid.innerHTML = "<p style='font-size:10px; padding:10px; color: #666;'>No cloud music.</p>";
        } else {
            cloudGrid.innerHTML = cloudSongs.map(s => cardHtml(s, s.docId)).join('');
        }
    });
}

// --- API Suggestion Search ---
async function searchSongs() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('apiResults');
    const resultsSection = document.getElementById('resultsSection');

    if (query.length < 2) { 
        resultsSection.style.display = "none"; 
        return; 
    }

    resultsSection.style.display = "block";
    resultsContainer.innerHTML = "<p style='color:#1db954; padding:10px;'>Suggesting songs...</p>";

    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        try {
            const response = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`);
            const res = await response.json();
            let finalResults = [];

            if (res.success && res.data.results.length > 0) {
                const apiSongs = res.data.results.map(s => ({
                    name: s.name,
                    artist: s.artists.primary[0].name,
                    img: s.image[2].url, 
                    url: s.downloadUrl[4].url 
                }));
                finalResults = [...apiSongs];
            }

            const localFiltered = allSongs.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.artist.toLowerCase().includes(query)
            );
            
            finalResults = [...finalResults, ...localFiltered];

            if (finalResults.length > 0) {
                resultsContainer.innerHTML = finalResults.map(s => cardHtml(s)).join('');
            } else {
                resultsContainer.innerHTML = "<p style='padding:15px; color:#ff0055;'>No matching songs.</p>";
            }
        } catch (err) {
            const localOnly = allSongs.filter(s => s.name.toLowerCase().includes(query));
            resultsContainer.innerHTML = localOnly.map(s => cardHtml(s)).join('');
        }
    }, 400);
}

window.onload = loadContent;
function closePlayer() { audio.pause(); document.getElementById('mainPlayer').style.display = 'none'; minimizePlayer(); }
function clearSearch() { document.getElementById('resultsSection').style.display = "none"; document.getElementById('searchInput').value = ""; }

function toggleDrawer() {
    const drawer = document.getElementById('sideDrawer');
    const overlay = document.getElementById('drawerOverlay');
    drawer.classList.toggle('open');
    overlay.style.display = drawer.classList.contains('open') ? 'block' : 'none';
}

function showPage(pageId) { document.getElementById(pageId).style.display = 'flex'; }
function hidePage(pageId) { document.getElementById(pageId).style.display = 'none'; }

// Swipe logic
let startX;
document.getElementById('sideDrawer').addEventListener('touchstart', e => startX = e.touches[0].clientX);
document.getElementById('sideDrawer').addEventListener('touchend', e => {
    if (startX - e.changedTouches[0].clientX > 50) toggleDrawer();
});