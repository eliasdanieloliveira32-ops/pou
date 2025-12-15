// Pegando elementos do DOM
const pou = document.getElementById('pou');
const feedBtn = document.getElementById('feed-btn');
const playBtn = document.getElementById('play-btn');
const sleepBtn = document.getElementById('sleep-btn');

const foodIcon = document.getElementById('food-icon');
const healthIcon = document.getElementById('health-icon');
const funIcon = document.getElementById('fun-icon');
const energyIcon = document.getElementById('energy-icon');
const levelIcon = document.getElementById('level-icon');

const coinDisplay = document.getElementById('coin-display');

const gameContainer = document.getElementById('game-container');

// Criar as barras visuais dinamicamente para evitar conflito de tag incorreta
const statusBarsConfig = [
  { id: 'food', label: 'Fome', color: '#4caf50' },
  { id: 'health', label: 'Saúde', color: '#00bcd4' },
  { id: 'fun', label: 'Diversão', color: '#ff9800' },
  { id: 'energy', label: 'Energia', color: '#9c27b0' }
];

const statusBarsContainer = document.getElementById('status-bars');
const bars = {}; // armazenar divs de preenchimento e contêiner

// Criar as barras
function createBars() {
  statusBarsConfig.forEach(stat => {
    const container = document.createElement('div');
    container.className = 'status-bar-container';

    const fill = document.createElement('div');
    fill.className = 'status-bar-fill';
    fill.style.backgroundColor = stat.color;
    fill.style.width = '100%';

    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = stat.label;

    container.appendChild(fill);
    container.appendChild(label);
    statusBarsContainer.appendChild(container);

    bars[stat.id] = fill;
  });
}

// Estado inicial do Pou
let pouState = {
  food: 100,
  health: 100,
  fun: 100,
  energy: 100,
  coins: 310,
  level: 0,
  isSleeping: false,
};

// Constantes do sistema
const statusDecay = 1; // perda gradual a cada tick
const decayIntervalMs = 5000; // 5 segundos tick
const energyRecoveryRate = 3; // energia recuperada por tick no sono

// Salvar e carregar do localStorage
const storageKey = 'miniPouState';

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(pouState));
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    pouState = JSON.parse(saved);
  }
}

// Atualiza as barras e expressões
function updateUI() {
  bars.food.style.width = pouState.food + '%';
  bars.health.style.width = pouState.health + '%';
  bars.fun.style.width = pouState.fun + '%';
  bars.energy.style.width = pouState.energy + '%';

  coinDisplay.textContent = pouState.coins;
  levelIcon.textContent = pouState.level;

  // Atualiza expressão de Pou
  pou.classList.remove('sad', 'happy', 'sleeping');

  if (pouState.isSleeping) {
    pou.classList.add('sleeping');
  } else if (pouState.food < 30 || pouState.fun < 30) {
    pou.classList.add('sad');
  } else if (
    pouState.food > 70 &&
    pouState.fun > 70 &&
    pouState.energy > 70 &&
    pouState.health > 70
  ) {
    pou.classList.add('happy');
  }
}

// Animar botão (feedback visual)
function animateButton(btn) {
  btn.style.transform = 'scale(0.85)';
  btn.style.boxShadow = '0 0 15px 4px #76e87e';
  setTimeout(() => {
    btn.style.transform = '';
    btn.style.boxShadow = '';
  }, 200);
}

// Tick para decadência e recuperação da energia
function tick() {
  if (pouState.isSleeping) {
    pouState.energy = Math.min(100, pouState.energy + energyRecoveryRate);
    if (pouState.energy >= 100) {
      pouState.isSleeping = false;
      showMessage('Pou acordou!');
    }
  } else {
    pouState.food = Math.max(0, pouState.food - statusDecay);
    pouState.fun = Math.max(0, pouState.fun - statusDecay);
    pouState.energy = Math.max(0, pouState.energy - statusDecay);
    pouState.health = Math.max(0, pouState.health - statusDecay / 2);
  }

  updateUI();
  saveState();
}

// Mensagem rápida (substitui temporariamente moedas para exemplo)
function showMessage(msg) {
  const origText = coinDisplay.textContent;
  coinDisplay.textContent = msg;
  setTimeout(() => {
    coinDisplay.textContent = pouState.coins;
  }, 3000);
}

// Logica dos botões
feedBtn.addEventListener('click', () => {
  if (pouState.isSleeping) return;
  animateButton(feedBtn);
  pouState.food = Math.min(100, pouState.food + 25);
  pouState.energy = Math.max(0, pouState.energy - 5);
  saveState();
  updateUI();
});

playBtn.addEventListener('click', () => {
  if (pouState.isSleeping) return;
  animateButton(playBtn);
  pouState.fun = Math.min(100, pouState.fun + 30);
  pouState.energy = Math.max(0, pouState.energy - 15);
  saveState();
  updateUI();
});

sleepBtn.addEventListener('click', () => {
  animateButton(sleepBtn);
  pouState.isSleeping = !pouState.isSleeping;
  saveState();
  updateUI();
});

// Inicialização da aplicação
createBars();
loadState();
updateUI();
setInterval(tick, decayIntervalMs);
