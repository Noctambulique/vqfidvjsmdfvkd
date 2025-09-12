const NPC_COUNT = 18;
const stage = document.getElementById('stage');
const screen = document.getElementById('screen');
const scoreEl = document.getElementById('score');
const meterEl = document.getElementById('meter');
const snapBtn = document.getElementById('snap');
const nextBtn = document.getElementById('nextScene');

let npcs = [];
let currentShot = null;
let score = 0;
let escalation = 0;
let tick = 0;
let ended = false;

const IMAGES = [
  {id:'happy', label:'Sourire 😊', effect:{mood:'happy', delta:2}},
  {id:'loner', label:'Solitude 😔', effect:{mood:'sad', delta:3}},
  {id:'argue', label:'Dispute 😡', effect:{mood:'angry', delta:8}},
  {id:'weird', label:'Bizarre 🤨', effect:{mood:'curious', delta:4}},
  {id:'hero', label:'Héros 🏅', effect:{mood:'admire', delta:3}},
  {id:'panic', label:'Panique 🫢', effect:{mood:'panicked', delta:10}},

  // Nouveaux emojis / émotions
  {id:'love', label:'Amour ❤️', effect:{mood:'love', delta:5}},       // augmente bonheur mais aussi vulnérabilité
  {id:'joy', label:'Joie intense 🤩', effect:{mood:'joy', delta:6}},  // boost fort mais temporaire
  {id:'grief', label:'Tristesse 😢', effect:{mood:'grief', delta:4}}, // augmente tristesse + un peu d’agressivité
  {id:'fear', label:'Peur 👻', effect:{mood:'fear', delta:7}},        // panique contagieuse
  {id:'hope', label:'Espoir 🌈', effect:{mood:'hope', delta:3}},      // réduit un peu l’agressivité
  {id:'jealous', label:'Jalousie 😒', effect:{mood:'jealous', delta:6}} // pousse vers colère silencieuse
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
    el.addEventListener('click', () => inspectNPC(i));
    stage.appendChild(el);
    npcs.push({el,mood,aggression:0});
  }
}
function randomEmoji(){
  const set = ['🙂','😐','😴','😬','🤓','🫡','🧐','😮','😶'];
  return set[Math.floor(Math.random()*set.length)];
}

// Actions principales
function takePhoto(){
  if(ended) return;
  currentShot = IMAGES[Math.floor(Math.random()*IMAGES.length)];
  screen.innerHTML = '<div style="font-size:16px">Photo prise:</div><div class="big">'+currentShot.label+'</div>';
}
function publish(){
  if(!currentShot || ended) return;
  const e = currentShot.effect;
  const count = 2 + Math.floor(Math.random()*5);
  const indices = sampleIndices(count);
  indices.forEach(i=>applyEffectToNPC(i,e));
  escalation += e.delta + Math.floor(Math.random()*3);
  score += e.delta;
  updateUI();
  currentShot = null;
  screen.innerHTML = 'Aucun cliché — Appuie pour photographier';
  checkEnd();
}

function sampleIndices(n){
  const arr = Array.from({length:NPC_COUNT},(_,i)=>i);
  shuffle(arr);
  return arr.slice(0,n);
}
function applyEffectToNPC(i,e){
  const npc = npcs[i];

  // gestion des humeurs et impacts
  switch(e.mood){
    case 'angry':
    case 'panicked':
    case 'fear':
      npc.aggression += Math.max(2, Math.floor(e.delta/2));
      break;
    case 'sad':
    case 'grief':
    case 'jealous':
      npc.aggression += 1;
      break;
    case 'admire':
    case 'hope':
    case 'love':
      npc.aggression = Math.max(0, npc.aggression-2);
      break;
    case 'joy':
      npc.aggression = Math.max(0, npc.aggression-1);
      break;
  }

  npc.mood = e.mood;
  renderNPC(npc);
}
function renderNPC(npc){
  const el = npc.el;
  el.dataset.mood = npc.mood || 'neutral';
  const face = moodEmoji(npc);
  el.innerHTML = face + '<div class="mood">' + el.dataset.mood + '</div>';
  if(npc.aggression>=8){
    el.style.background = 'linear-gradient(180deg, rgba(255,107,107,0.12), rgba(255,107,107,0.06))';
    el.style.boxShadow = 'inset 0 0 8px rgba(255,107,107,0.08)';
  } else if(npc.aggression>=4){
    el.style.background = 'linear-gradient(180deg, rgba(255,207,92,0.06), rgba(255,207,92,0.02))';
  } else {
    el.style.background = 'rgba(255,255,255,0.03)';
    el.style.boxShadow = 'none';
  }
}
function moodEmoji(npc){
  if(npc.aggression>=10) return '🔥';
  switch(npc.mood){
    case 'happy': return '😄';
    case 'sad': return '😟';
    case 'angry': return '😠';
    case 'curious': return '🧐';
    case 'admire': return '🤩';
    case 'panicked': return '🫨';
    case 'love': return '😍';
    case 'joy': return '😁';
    case 'grief': return '😭';
    case 'fear': return '😱';
    case 'hope': return '🥺';
    case 'jealous': return '😒';
    default: return randomEmoji();
  }
}
function updateUI(){
  scoreEl.textContent = score;
  meterEl.style.width = Math.min(100, escalation) + '%';
}
function checkEnd(){
  if(escalation>=90 && !ended){
    ended = true;
    screen.innerHTML = '<div class="big">LA TENSION EXPLOSE</div><div style="margin-top:8px;color:var(--muted)">Nous sommes ce que nous regardons.</div>';
    npcs.forEach(n=>{ n.aggression = Math.max(n.aggression, 8); renderNPC(n); });
  }
}
function inspectNPC(i){
  const npc = npcs[i];
  console.log('NPC #' + i, npc);
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] }}

// Events
snapBtn.addEventListener('click', takePhoto);
nextBtn.addEventListener('click', publish);
window.addEventListener('keydown', (e)=>{
  if(e.code==='Space') { e.preventDefault(); takePhoto(); }
  if(e.key==='c' || e.key==='C') publish();
});

// Simulation
function step(){
  tick++;
  for(let i=0;i<npcs.length;i++){
    const n = npcs[i];
    if(n.aggression>3){
      const neighbors = neighborIndices(i,2);
      neighbors.forEach(j=>{
        if(Math.random()<0.08 + n.aggression*0.01){
          npcs[j].aggression += 1;
          if(npcs[j].aggression>4) npcs[j].mood = 'angry';
          renderNPC(npcs[j]);
        }
      });
    }
    if(n.aggression>0 && Math.random()<0.02) { n.aggression = Math.max(0,n.aggression-1); renderNPC(n); }
  }
  if(!ended && Math.random()<0.02) { escalation += 0.2; updateUI(); }
  if(!ended && escalation>=90) checkEnd();
}
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

// Lancer
initNPCs(); updateUI();
setInterval(step, 700);
