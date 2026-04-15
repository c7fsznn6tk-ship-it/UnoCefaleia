const cards = [
  {
    color: "Vermelho",
    title: "Passou a vez",
    corner: "Ø",
    value: "",
    type: "Acao especial",
    cssClass: "red",
    displayMode: "icon-only",
    icon: "skip",
    startsTimer: false,
    weight: 1
  },
  {
    color: "Azul",
    title: "Passou a vez",
    corner: "Ø",
    value: "",
    type: "Acao especial",
    cssClass: "blue",
    displayMode: "icon-only",
    icon: "skip",
    startsTimer: false,
    weight: 1
  },
  {
    color: "Vermelho",
    title: "Inverter rodada",
    corner: "↺",
    value: "",
    type: "Acao especial",
    cssClass: "red",
    displayMode: "icon-only",
    icon: "reverse",
    startsTimer: false,
    weight: 1
  },
  {
    color: "Azul",
    title: "Inverter rodada",
    corner: "↺",
    value: "",
    type: "Acao especial",
    cssClass: "blue",
    displayMode: "icon-only",
    icon: "reverse",
    startsTimer: false,
    weight: 1
  },
  {
    color: "Vermelho",
    title: "Comprar duas",
    corner: "+2",
    value: "+2",
    type: "Acao especial",
    cssClass: "red",
    displayMode: "text-only",
    icon: "",
    startsTimer: true,
    weight: 3
  },
  {
    color: "Azul",
    title: "Comprar duas",
    corner: "+2",
    value: "+2",
    type: "Acao especial",
    cssClass: "blue",
    displayMode: "text-only",
    icon: "",
    startsTimer: true,
    weight: 3
  },
  {
    color: "Vermelho/Azul",
    title: "Coringa",
    corner: "★",
    value: "",
    type: "Carta especial",
    cssClass: "dual",
    displayMode: "icon-only",
    icon: "wild",
    startsTimer: true,
    weight: 3
  },
  {
    color: "Vermelho/Azul",
    title: "Comprar quatro",
    corner: "+4",
    value: "+4",
    type: "Carta especial",
    cssClass: "dual",
    displayMode: "has-icon-text",
    icon: "draw4",
    startsTimer: true,
    weight: 0.2
  }
];

const drawButton = document.getElementById("draw-button");
const drawnCard = document.getElementById("drawn-card");
const cardFlip = document.getElementById("card-flip");
const cardShell = document.getElementById("card-shell");
const cardColor = document.getElementById("card-color");
const cardIconArt = document.getElementById("card-icon-art");
const cardValue = document.getElementById("card-value");
const cardCornerTop = document.getElementById("card-corner-top");
const cardCornerBottom = document.getElementById("card-corner-bottom");
const cardType = document.getElementById("card-type");
const cardMessage = document.getElementById("card-message");
const timerMinutesSelect = document.getElementById("timer-minutes");
const timerDisplay = document.getElementById("timer-display");
const timerStatus = document.getElementById("timer-status");
const timerPanel = timerDisplay.parentElement;
let revealTimeout;
let finishAnimationTimeout;
let timerInterval;
let warningSecondSpoken = null;
let currentTimerDuration = Number(timerMinutesSelect.value) * 60;
let nextTimerDuration = currentTimerDuration;
let audioContext;

function getRandomCard() {
  const totalWeight = cards.reduce((sum, card) => sum + card.weight, 0);
  let randomValue = Math.random() * totalWeight;

  for (const card of cards) {
    randomValue -= card.weight;

    if (randomValue <= 0) {
      return card;
    }
  }

  return cards[cards.length - 1];
}

function getIconMarkup(iconName) {
  const icons = {
    skip: `
      <svg class="icon-svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="icon-stroke" cx="50" cy="50" r="28"></circle>
        <path class="icon-stroke" d="M30 70 L70 30"></path>
      </svg>
    `,
    reverse: `
      <svg class="icon-svg" viewBox="0 0 100 100" aria-hidden="true">
        <path class="icon-stroke" d="M67 26c-16-9-35-4-45 10"></path>
        <path class="icon-fill" d="M70 16 L78 33 L59 31 Z"></path>
        <path class="icon-stroke" d="M33 74c16 9 35 4 45-10"></path>
        <path class="icon-fill" d="M30 84 L22 67 L41 69 Z"></path>
      </svg>
    `,
    draw: `
      <svg class="icon-svg" viewBox="0 0 100 100" aria-hidden="true">
        <rect class="icon-stroke" x="23" y="28" width="34" height="42" rx="6"></rect>
        <rect class="icon-stroke" x="43" y="34" width="34" height="42" rx="6"></rect>
      </svg>
    `,
    draw4: `
      <svg class="icon-svg" viewBox="0 0 100 100" aria-hidden="true">
        <rect class="icon-stroke" x="22" y="26" width="28" height="38" rx="5"></rect>
        <rect class="icon-stroke" x="34" y="32" width="28" height="38" rx="5"></rect>
        <rect class="icon-stroke" x="46" y="38" width="28" height="38" rx="5"></rect>
      </svg>
    `,
    wild: `
      <svg class="icon-svg" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 18C32 18 18 32 18 50s14 32 32 32 32-14 32-32S68 18 50 18Z" fill="rgba(255,255,255,0.15)"></path>
        <path d="M50 22A28 28 0 0 1 78 50H50Z" fill="#ef4444"></path>
        <path d="M78 50A28 28 0 0 1 50 78V50Z" fill="#1d4ed8"></path>
        <path d="M50 78A28 28 0 0 1 22 50H50Z" fill="#ef4444"></path>
        <path d="M22 50A28 28 0 0 1 50 22V50Z" fill="#1d4ed8"></path>
        <circle class="icon-stroke" cx="50" cy="50" r="28"></circle>
      </svg>
    `
  };

  return icons[iconName] || "";
}

function updateCard(card) {
  cardShell.className = `card-shell card-front ${card.cssClass} ${card.displayMode}`;
  cardColor.textContent = card.color;
  cardIconArt.innerHTML = getIconMarkup(card.icon);
  cardValue.textContent = card.value;
  cardCornerTop.textContent = card.corner;
  cardCornerBottom.textContent = card.corner;
  cardType.textContent = card.type;
  cardMessage.textContent = `Carta sorteada: ${card.title} (${card.color})`;
  drawnCard.classList.remove("is-hidden");
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateTimerVisual(secondsLeft, state) {
  timerDisplay.textContent = formatTime(secondsLeft);
  timerDisplay.classList.toggle("is-warning", state === "warning");
  timerDisplay.classList.toggle("is-finished", state === "finished");
  timerPanel.classList.toggle("is-warning", state === "warning");
  timerPanel.classList.toggle("is-finished", state === "finished");
}

function ensureAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) {
      return null;
    }

    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playBeep(frequency, duration, volume, type = "sine") {
  const ctx = ensureAudioContext();

  if (!ctx) {
    return;
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const now = ctx.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playWarningBeep() {
  playBeep(880, 0.14, 0.08, "square");
}

function playFinishSound() {
  playBeep(660, 0.18, 0.09, "triangle");
  window.setTimeout(() => playBeep(990, 0.28, 0.12, "triangle"), 140);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  warningSecondSpoken = null;
}

function resetTimerPreview() {
  updateTimerVisual(nextTimerDuration, "idle");
  timerStatus.textContent = `Tempo configurado: ${timerMinutesSelect.value} minuto(s). Esse valor sera usado na proxima carta comprada.`;
}

function finishTimer() {
  stopTimer();
  updateTimerVisual(0, "finished");
  timerStatus.textContent = "Tempo encerrado!";
  playFinishSound();
}

function startTimer() {
  stopTimer();
  currentTimerDuration = nextTimerDuration;
  let secondsLeft = currentTimerDuration;

  updateTimerVisual(secondsLeft, "idle");
  timerStatus.textContent = `Cronometro em andamento: ${formatTime(secondsLeft)} restantes.`;

  timerInterval = window.setInterval(() => {
    secondsLeft -= 1;

    if (secondsLeft <= 0) {
      finishTimer();
      return;
    }

    if (secondsLeft <= 10) {
      updateTimerVisual(secondsLeft, "warning");
      timerStatus.textContent = "Atencao: faltam menos de 10 segundos!";

      if (warningSecondSpoken !== secondsLeft) {
        playWarningBeep();
        warningSecondSpoken = secondsLeft;
      }
    } else {
      updateTimerVisual(secondsLeft, "idle");
      timerStatus.textContent = `Cronometro em andamento: ${formatTime(secondsLeft)} restantes.`;
    }
  }, 1000);
}

function animateDraw(card) {
  drawButton.disabled = true;
  drawnCard.classList.remove("is-hidden");
  drawnCard.classList.remove("is-animating");
  ensureAudioContext();

  clearTimeout(revealTimeout);
  clearTimeout(finishAnimationTimeout);

  void cardFlip.offsetWidth;
  drawnCard.classList.add("is-animating");

  revealTimeout = setTimeout(() => {
    updateCard(card);
  }, 320);

  finishAnimationTimeout = setTimeout(() => {
    drawnCard.classList.remove("is-animating");
    drawButton.disabled = false;
  }, 900);

  if (card.startsTimer) {
    startTimer();
    return;
  }

  stopTimer();
  currentTimerDuration = nextTimerDuration;
  updateTimerVisual(nextTimerDuration, "idle");
  timerStatus.textContent = `Carta ${card.title} sorteada. Compre uma nova carta para iniciar o cronometro.`;
}

timerMinutesSelect.addEventListener("change", () => {
  nextTimerDuration = Number(timerMinutesSelect.value) * 60;

  if (!timerInterval) {
    currentTimerDuration = nextTimerDuration;
    resetTimerPreview();
    return;
  }
  timerStatus.textContent = `Novo tempo salvo: ${timerMinutesSelect.value} minuto(s). Ele sera usado na proxima carta comprada.`;
});

resetTimerPreview();

drawButton.addEventListener("click", () => {
  const card = getRandomCard();
  animateDraw(card);
});
