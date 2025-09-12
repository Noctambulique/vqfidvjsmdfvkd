const NPC_COUNT = 18;
const stage = document.getElementById('stage');
const screen = document.getElementById('screen');
const scoreEl = document.getElementById('score');
const meterEl = document.getElementById('meter');
const snapBtn = document.getElementById('snap'); // bouton existant, on le recycle
const nextBtn = document.getElementById('nextScene');

let npcs = [];
let score = 0;
let escalation = 0;
let tick = 0;
let ended = false;

const EMOTIONS = [
  {mood:'happy', label:'Sourire 😊', delta:2},
  {mood:'sad', label:'Solitude 😔', delta:3},
  {mood:'angry', label:'Colère 😡', delta:6},
  {mood:'curious', label:'Curiosité 🤨', delta:2},
  {mood:'admire', label:'Admiration 🤩', delta:2},
  {mood:'panicked', label:'Panique 😱', delta:7},
  {mood:'love', label:'Amour ❤️', delta:3},
  {mood:'joy', label:'Joie 🤗', delta:4},
  {mood:'grief', label:'Tristesse 😢', delta:3},
  {mood:'fear', label:'Peur 👻', delta:5},
  {mood:'hope', label:'Espoir 🌈', delta:2},
  {mood:'jealous', label:'Jalousie 😒', delta:4}
];

// Initialisation
function initNPCs(){
  npcs = [];
  stage.innerHTML = '';
  for(let i=0;i<NPC_COUNT;i++){
    const mood = 'neutral';
    const el = document.createElement('div');
    el.className = 'npc';
    el.dataset.idx = i;
    el.dataset.mood = mood;
    el.innerHTML = randomEmoji() + '<div class="mood">' + mood + '</div>';
    stage.appendChild(el);
    npcs.push({el,mood,aggression:0});
  }
}

function randomEmoji(){
  const set = ['🙂','😐','😴','😬','🤓','🫡','🧐','😮'];
  return set[Math.floor(Math.random()*set.length)];
}

// 👉 Nouvelle fonction : afficher la réaction d’un NPC
function showReaction(){
  if(ended) return;
  const npc = npcs[Math.floor(Math.random()*NPC_COUNT)];
  const emo = EMOTIONS[Math.floor(Math.random()*EMOTIONS.length)];
  npc.mood = emo.mood;
  npc.aggression += Math.floor(emo.delta/2); // chaque réaction influence l'agressivité
  renderNPC(npc);

  escalation += emo.delta;
  score += emo.delta;

  screen.innerHTML = '<div style="font-size:16px">Réaction affichée :</div><div class="big">'+emo.label+'</div>';

  updateUI();
  checkEnd();
}

// Mise à jour NPC
function renderNPC(npc){
  const el = npc.el;
  el.dataset.mood = npc.mood || 'neutral';
  const face = moodEmoji(npc);
  el.innerHTML = face + '<div class="mood">' + el.dataset.mood + '</div>';

  // 👉 Colère facile : seuil abaissé
  if(npc.aggression>=5){
    npc.mood = 'angry';
    el.style.background = 'linear-gradient(180deg, rgba(255,50,50,0.15), rgba(255,50,50,0.08))';
  } else if(npc.aggression>=2){
    el.style.background = 'linear-gradient(180deg, rgba(255,200,100,0.06), rgba(255,200,100,0.03))';
  } else {
    el.style.background = 'rgba(255,255,255,0.03)';
    el.style.boxShadow = 'none';
  }
}

function moodEmoji(npc){
  if(npc.aggression>=8) return '🔥';
  switch(npc.mood){
    case 'happy': return '😄';
    case 'sad': return '😟';
    case 'angry': return '😠';
    case 'curious': return '🧐';
    case 'admire': return '🤩';
    case 'panicked': return '😱';
    case 'love': return '❤️';
    case 'joy': return '😁';
    case 'grief': return '😭';
    case 'fear': return '👻';
    case 'hope': return '🌈';
    case 'jealous': return '😒';
    default: return randomEmoji();
  }
}

// UI
function updateUI(){
  scoreEl.textContent = score;
  meterEl.style.width = Math.min(100, escalation) + '%';
}
function checkEnd(){
  if(escalation>=90 && !ended){
    ended = true;
    screen.innerHTML = '<div class="big">LA TENSION EXPLOSE</div><div style="margin-top:8px;color:var(--muted)">Nous sommes ce que nous regardons.</div>';
    npcs.forEach(n=>{ n.aggression = Math.max(n.aggression, 6); renderNPC(n); });
  }
}

// Simulation
function step(){
  tick++;

  // 👉 toutes les 3 secondes (tick*700ms ≈ 3s)
  if(tick % 4 === 0){
    const count = Math.floor(NPC_COUNT*0.2); // 20% des NPC
    const indices = sampleIndices(count);
    indices.forEach(i=>{
      const emo = EMOTIONS[Math.floor(Math.random()*EMOTIONS.length)];
      npcs[i].mood = emo.mood;
      npcs[i].aggression += Math.floor(emo.delta/2);
      renderNPC(npcs[i]);
    });
  }

  // propagation plus agressive
  for(let i=0;i<npcs.length;i++){
    const n = npcs[i];
    if(n.aggression>2){
      const neighbors = neighborIndices(i,2);
      neighbors.forEach(j=>{
        if(Math.random()<0.15){ // probabilité augmentée
          npcs[j].aggression += 1;
          if(npcs[j].aggression>=3) npcs[j].mood = 'angry';
          renderNPC(npcs[j]);
        }
      });
    }
  }

  if(!ended && Math.random()<0.03) { escalation += 0.3; updateUI(); }
  if(!ended && escalation>=90) checkEnd();
}

function sampleIndices(n){
  const arr = Array.from({length:NPC_COUNT},(_,i)=>i);
  shuffle(arr);
  return arr.slice(0,n);
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } }
function neighborIndices(i,r){
  const cols = 6; const row = Math.floor(i/cols); const col = i%cols; const res=[];
  for(let dr=-r;dr<=r;dr++) for(let dc=-r;dc<=r;dc++){
    const rr=row+dr; const cc=col+dc;
    if(rr<0||cc<0) continue;
    const idx=rr*cols+cc;
    if(idx>=0 && idx<npcs.length && idx!==i) res.push(idx);
  }
  return res;
}

// Événements
snapBtn.textContent = "Afficher une réaction"; // changer texte du bouton
snapBtn.addEventListener('click', showReaction);

// Lancer
initNPCs(); updateUI();
setInterval(step, 700);
