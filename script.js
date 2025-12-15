// --- VARIÁVEIS DE ESTADO E CONSTANTES ---
let fome = 100;
let saude = 100;
let diversao = 100;
let energia = 100; 
let moedas = 50; 
let ambienteAtual = 'cozinha'; 

const INTERVALO_TEMPO = 3000; 
const DECAY_RATE = 2; 
const MOEDA_RATE = 1; 

let minigameAtivo = false;
let cliquesMiniGame = 0;
let tempoMiniGame = 5; 
let timerInterval;


// --- REFERÊNCIAS AOS ELEMENTOS HTML ---
const $moedasValor = document.getElementById('moedas-valor');
const $pouElement = document.getElementById('pou');
const $gameContainer = document.getElementById('game-container');
const $panelTitulo = document.getElementById('panel-titulo');
const $actionButtons = document.getElementById('action-buttons');
const $minigameContainer = document.getElementById('minigame-container');
const $cliquesCount = document.getElementById('cliques-count');
const $minigameButton = document.getElementById('minigame-button');
const $minigameTimer = document.getElementById('minigame-timer');


// --- FUNÇÕES DE UTILIDADE E ATUALIZAÇÃO ---

function clamp(valor) {
    return Math.max(0, Math.min(100, valor));
}

function atualizarMoedasDisplay() {
    $moedasValor.textContent = moedas;
}

/**
 * Atualiza a expressão do Pou (o semicírculo da boca).
 * (Com posicionamento absoluto para evitar problemas de layout)
 */
function atualizarStatusDisplay() {
    let bocaContent = ''; 

    if (saude === 0) {
        bocaContent = 'X'; 
    } else if (fome === 0 || diversao === 0 || energia === 0) {
        bocaContent = 'o'; 
    } else if (fome < 20 || diversao < 20 || energia < 20) {
        bocaContent = 'c'; 
    } else {
        bocaContent = 'J'; // Sorriso
    }

    $pouElement.textContent = bocaContent;
    
    // Ajustes de estilo para posicionar a boca (Posicionamento Absoluto CRÍTICO)
    $pouElement.style.position = 'absolute'; 
    $pouElement.style.left = '50%';
    
    // Estilos Específicos
    if (bocaContent === 'J') {
        $pouElement.style.fontSize = '3em';
        $pouElement.style.top = '75px'; 
        // Rotaciona e move ligeiramente para a esquerda para a boca lateral do Pou
        $pouElement.style.transform = 'translateX(-30px) rotate(-90deg)'; 
    } else if (bocaContent === 'o') {
        $pouElement.style.fontSize = '4em';
        $pouElement.style.top = '65px'; 
        $pouElement.style.transform = 'translateX(-50%)';
    } else {
        $pouElement.style.fontSize = '2em';
        $pouElement.style.top = '70px'; 
        $pouElement.style.transform = 'translateX(-50%)';
    }
}

// --- MOTOR DO JOGO (GAME LOOP) ---

function gameLoop() {
    if (minigameAtivo) return; 

    // Decaimento dos Status
    fome = clamp(fome - DECAY_RATE);
    diversao = clamp(diversao - DECAY_RATE);
    energia = clamp(energia - DECAY_RATE * (fome < 50 || diversao < 50 ? 1.5 : 0.5));

    if (fome === 0 || diversao === 0 || energia === 0) {
        saude = clamp(saude - DECAY_RATE * 2);
    }

    // Geração de Moedas
    moedas += MOEDA_RATE;
    atualizarMoedasDisplay();

    // Verifica a 'Morte'
    if (saude === 0) {
        alert("🚨 Seu Pou morreu! Recarregue a página para começar de novo.");
        clearInterval(gameLoopInterval); 
        return;
    }

    // Atualiza o HTML
    atualizarStatusDisplay();
}

const gameLoopInterval = setInterval(gameLoop, INTERVALO_TEMPO);


// --- LÓGICA DE ITENS E LOJA (MANTIDA) ---

const itensLoja = {
    "food_maca": { nome: "🍎 Maçã", custo: 5, efeito: { fome: 20 } },
    "pocao_energia": { nome: "⚡ Poção de Energia", custo: 15, efeito: { energia: 50 } },
    "pocao_saude": { nome: "❤️ Poção de Saúde", custo: 30, efeito: { saude: 50 } },
    "food_pizza": { nome: "🍕 Pizza", custo: 15, efeito: { fome: 50 } }
};

function comprarEUsarItem(itemId) {
    const item = itensLoja[itemId];

    if (moedas >= item.custo) {
        moedas -= item.custo;
        atualizarMoedasDisplay();

        if (item.efeito.fome) { fome = clamp(fome + item.efeito.fome); }
        if (item.efeito.energia) { energia = clamp(energia + item.efeito.energia); }
        if (item.efeito.saude) { saude = clamp(saude + item.efeito.saude); }

        atualizarStatusDisplay();
        alert(`Você comprou e usou ${item.nome}! Status restaurados.`);
        mudarAmbiente(ambienteAtual);
    } else {
        alert(`Você não tem moedas suficientes! Custa ${item.custo}.`);
    }
}

// --- FUNÇÕES DE AÇÃO E NAVEGAÇÃO (MANTIDAS) ---

function curarPou() {
    saude = clamp(saude + 30);
    diversao = clamp(diversao + 5);
    atualizarStatusDisplay();
    alert("Pou curado! Que banho bom!");
}

function mudarAmbiente(ambiente) {
    ambienteAtual = ambiente;
    $panelTitulo.textContent = ambiente.charAt(0).toUpperCase() + ambiente.slice(1);
    
    $gameContainer.className = '';
    $gameContainer.classList.add(`ambiente-${ambiente}`);
    
    let botoesHTML = '';

    if (ambiente === 'cozinha') {
        botoesHTML = `
            <p>Comida:</p>
            <button onclick="comprarEUsarItem('food_maca')">${itensLoja.food_maca.nome} (${itensLoja.food_maca.custo} Moedas)</button>
            <button onclick="comprarEUsarItem('food_pizza')">${itensLoja.food_pizza.nome} (${itensLoja.food_pizza.custo} Moedas)</button>
        `;
    } else if (ambiente === 'banheiro') {
        botoesHTML = `
            <p>Cuidados:</p>
            <button onclick="curarPou()">🧼 Usar Sabonete (Grátis)</button>
            <button onclick="comprarEUsarItem('pocao_saude')">${itensLoja.pocao_saude.nome} (${itensLoja.pocao_saude.custo} Moedas)</button>
        `;
    } else if (ambiente === 'loja') {
         botoesHTML = Object.keys(itensLoja).map(key => {
             const item = itensLoja[key];
             let efeitoDisplay = Object.keys(item.efeito).map(e => `+${item.efeito[e]} ${e.toUpperCase()}`).join(', ');
             
             return `
                 <div class="item-loja">
                    <p><strong>${item.nome}</strong> | Efeito: ${efeitoDisplay}</p>
                    <button onclick="comprarEUsarItem('${key}')">Comprar (${item.custo} Moedas)</button>
                 </div>
             `;
         }).join('');
         
         botoesHTML = `<p>Itens disponíveis:</p><div class="loja-list">${botoesHTML}</div>`;
    }
    
    $actionButtons.innerHTML = botoesHTML;
}

// --- FUNÇÕES PLACEHOLDER DE STATUS E MINI GAME (MANTIDAS) ---

function fomeStatus() { alert(`Fome: ${fome}.`); }
function saudeStatus() { alert(`Saúde: ${saude}.`); }
function diversaoStatus() { alert(`Diversão: ${diversao}.`); }
function energiaStatus() { alert(`Energia: ${energia}.`); }

function abrirMiniGame() {
    if (minigameAtivo) return;
    minigameAtivo = true;
    cliquesMiniGame = 0;
    tempoMiniGame = 5;
    $cliquesCount.textContent = 0;
    $minigameTimer.textContent = tempoMiniGame;
    $gameContainer.classList.add('hidden');
    $minigameContainer.classList.remove('hidden');
    $minigameButton.disabled = true;
    setTimeout(() => {
        $minigameButton.disabled = false;
        iniciarTimerMiniGame();
    }, 1000);
}

function iniciarTimerMiniGame() {
    timerInterval = setInterval(() => {
        tempoMiniGame--;
        $minigameTimer.textContent = tempoMiniGame;
        if (tempoMiniGame <= 0) {
            finalizarMiniGame();
        }
    }, 1000); 
}

function contarClique() {
    if (minigameAtivo) {
        cliquesMiniGame++;
        $cliquesCount.textContent = cliquesMiniGame;
    }
}

function finalizarMiniGame(saiuCedo = false) {
    clearInterval(timerInterval); 
    $minigameButton.disabled = true;

    if (!saiuCedo) {
        const diversaoGanha = 5 + Math.floor(cliquesMiniGame / 3);
        const moedasGanhas = 10 + cliquesMiniGame;
        diversao = clamp(diversao + diversaoGanha);
        moedas += moedasGanhas;
        alert(`🎉 Fim do Mini Game! ${cliquesMiniGame} cliques.\n\nVocê ganhou:\n+${diversaoGanha} Diversão\n+${moedasGanhas} Moedas!`);
    } else {
        alert("Você saiu do Mini Game.");
    }
    
    minigameAtivo = false;
    $gameContainer.classList.remove('hidden');
    $minigameContainer.classList.add('hidden');
    
    mudarAmbiente(ambienteAtual);
    atualizarStatusDisplay();
    atualizarMoedasDisplay();
}

// --- INICIALIZAÇÃO ---
mudarAmbiente('cozinha');
atualizarStatusDisplay();
atualizarMoedasDisplay();
