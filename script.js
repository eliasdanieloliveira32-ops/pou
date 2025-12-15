// Referências dos elementos da UI
const barFood = document.getElementById('bar-food');
const barHealth = document.getElementById('bar-health');
const barFun = document.getElementById('bar-fun');
const barEnergy = document.getElementById('bar-energy');

const pouElement = document.getElementById('pou');

const btnFeed = document.getElementById('feed-btn');
const btnPlay = document.getElementById('play-btn');
const btnSleep = document.getElementById('sleep-btn');

// Estados principais do Pou
let state = {
  food: 100,
  health: 100,
  fun: 100,
  energy: 100,
  isSleeping: false,
};

// Constantes para o sistema
const STATUS_DECAY = 0.5; // a cada tick (nível que diminui)
const DECAY_INTERVAL = 5000; // ms entre decaimentos automáticos
const ENERGY_RECOVERY_RATE = 1.5; // energia recuperada por tick no sono

// Inicializar interface e estados
function init() {
  loadState();
  updateUI();
  setInterval(tick, DECAY_INTERVAL);
}

// Salvamento no localStorage
function saveState() {
  localStorage.setItem('miniPouState', JSON.stringify(state));
}

// Carregar do localStorage
function loadState() {
  const saved = localStorage.getItem('miniPouState');
  if (saved) {
    state = JSON.parse(saved);
  }
}

// Atualiza elementos da interface conforme o estado atual
function updateUI() {
  barFood.style.width = state.food + '%';
  barHealth.style.width = state.health + '%';
  barFun.style.width = state.fun + '%';
  barEnergy.style.width = state.energy + '%';

  // Atualiza expressão do Pou baseada no estado
  pouElement.classList.remove('pou-sad', 'pou-sleeping', 'pou-happy');

  if(state.isSleeping) {
    pouElement.classList.add('pou-sleeping');
  }
  else if(state.food < 30 || state.fun < 30) {
    pouElement.classList.add('pou-sad');
  }
  else if(state.food > 70 && state.fun > 70 && state.energy > 70) {
    pouElement.classList.add('pou-happy');
  }
}

// Função para animar botão no clique (feedback visual)
function animateButton(btn) {
  btn.classList.add('clicked');
  setTimeout(() => {
    btn.classList.remove('clicked');
  }, 200);
}

// Tick do sistema: decresce estados e recupera energia se dormindo
function tick() {
  if(state.isSleeping) {
    // Recupera energia enquanto dorme (limitado a 100)
    state.energy = Math.min(100, state.energy + ENERGY_RECOVERY_RATE * (DECAY_INTERVAL / 1000));
    // Pou acorda automaticamente se energia está cheia
    if(state.energy >= 100) {
      state.isSleeping = false;
    }
  } else {
    // Decaimento dos status
    state.food = Math.max(0, state.food - STATUS_DECAY);
    state.fun = Math.max(0, state.fun - STATUS_DECAY);
    state.energy = Math.max(0, state.energy - STATUS_DECAY);
    state.health = Math.max(0, state.health - STATUS_DECAY / 2);
  }
  updateUI();
  saveState();
}

// Eventos dos botões

btnFeed.addEventListener('click', () => {
  if(state.isSleeping) return; // Sem interações enquanto dorme
  animateButton(btnFeed);
  // Alimenta: aumenta food, reduz energia levemente
  state.food = Math.min(100, state.food + 25);
  state.energy = Math.max(0, state.energy - 5);
  saveState();
  updateUI();
});

btnPlay.addEventListener('click', () => {
  if(state.isSleeping) return;
  animateButton(btnPlay);
  // Brincar: aumenta fun, reduz energia
  state.fun = Math.min(100, state.fun + 30);
  state.energy = Math.max(0, state.energy - 15);
  saveState();
  updateUI();
});

btnSleep.addEventListener('click', () => {
  animateButton(btnSleep);
  // Ativa ou desativa o dormir
  state.isSleeping = !state.isSleeping;
  saveState();
  updateUI();
});

// Inicializar app
init();
