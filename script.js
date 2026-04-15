const cards = [
  {
    color: "Vermelho",
    title: "Passou a vez",
    corner: "O",
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
    corner: "O",
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
    corner: "R",
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
    corner: "R",
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
    corner: "*",
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
const openQuestionsButton = document.getElementById("open-questions-button");
const quizPanel = document.getElementById("quiz-panel");
const quizDialog = document.getElementById("quiz-dialog");
const quizLoading = document.getElementById("quiz-loading");
const quizQuestionBlock = document.getElementById("quiz-question-block");
const quizCounter = document.getElementById("quiz-counter");
const quizQuestionText = document.getElementById("quiz-question-text");
const quizOptions = document.getElementById("quiz-options");
const quizConfirm = document.getElementById("quiz-confirm");
const quizConfirmText = document.getElementById("quiz-confirm-text");
const quizConfirmYes = document.getElementById("quiz-confirm-yes");
const quizConfirmNo = document.getElementById("quiz-confirm-no");
const quizResult = document.getElementById("quiz-result");
const quizResultText = document.getElementById("quiz-result-text");
const quizResultNext = document.getElementById("quiz-result-next");
const quizResultHome = document.getElementById("quiz-result-home");

let revealTimeout;
let finishAnimationTimeout;
let timerInterval;
let warningSecondSpoken = null;
let currentTimerDuration = Number(timerMinutesSelect.value) * 60;
let nextTimerDuration = currentTimerDuration;
let audioContext;
let questionsBank = [];
let pendingAnswer = null;
let activeQuestion = null;
let quizQueue = [];
let quizAnsweredCount = 0;
let quizMode = "skip";
let awaitingSessionRestartChoice = false;

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

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function repairMojibake(text) {
  try {
    let repaired = text;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (!/[ÃÂâ€™€œ]/.test(repaired)) {
        break;
      }

      const bytes = Uint8Array.from(repaired, (character) => character.charCodeAt(0) & 255);
      repaired = new TextDecoder("utf-8").decode(bytes);
    }

    return repaired;
  } catch {
    return text;
  }
}

function parseQuestions(rawText) {
  const normalizedText = rawText.replace(/\r\n/g, "\n");
  const [questionsSection = "", answerSection = ""] = normalizedText.split(/\nGABARITO\n/);
  const answerMap = new Map(
    [...answerSection.matchAll(/(\d+)\.\s*([A-E])/g)].map((match) => [Number(match[1]), match[2]])
  );
  const questionBlocks = questionsSection
    .split(/\n-+\n/g)
    .map((block) => block.trim())
    .filter((block) => /^\d+\.\s+Quest/i.test(block));

  return questionBlocks
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const header = lines.shift();
      const numberMatch = header.match(/^(\d+)\./);

      if (!numberMatch) {
        return null;
      }

      const id = Number(numberMatch[1]);
      const promptParts = [];
      const options = [];
      let currentOption = null;

      for (const line of lines) {
        const optionMatch = line.match(/^([A-E])\)\s*(.*)$/);

        if (optionMatch) {
          if (currentOption) {
            options.push(currentOption);
          }

          currentOption = {
            letter: optionMatch[1],
            text: optionMatch[2].trim()
          };
          continue;
        }

        if (currentOption) {
          currentOption.text = `${currentOption.text} ${line}`.trim();
        } else {
          promptParts.push(line);
        }
      }

      if (currentOption) {
        options.push(currentOption);
      }

      return {
        id,
        prompt: normalizeWhitespace(promptParts.join(" ")),
        options: options.map((option) => ({
          letter: option.letter,
          text: normalizeWhitespace(option.text)
        })),
        correct: answerMap.get(id)
      };
    })
    .filter((question) => question && question.options.length >= 2 && question.correct);
}

function initializeQuestions() {
  if (typeof QUESTIONS_RAW !== "string") {
    quizLoading.textContent = "Nao foi possivel carregar as perguntas.";
    return;
  }

  questionsBank = parseQuestions(repairMojibake(QUESTIONS_RAW));

  if (!questionsBank.length) {
    quizLoading.textContent = "Nao foi possivel preparar as perguntas.";
    return;
  }

  quizLoading.textContent = `${questionsBank.length} perguntas prontas para o desafio.`;
}

function hideQuizSections() {
  quizQuestionBlock.classList.add("is-hidden");
  quizConfirm.classList.add("is-hidden");
  quizResult.classList.add("is-hidden");
}

function resetQuizFeedback() {
  quizDialog.classList.remove("is-success", "is-error");
  quizResult.classList.remove("is-success", "is-error");
}

function closeQuizPanel() {
  pendingAnswer = null;
  activeQuestion = null;
  awaitingSessionRestartChoice = false;
  resetQuizFeedback();
  quizPanel.classList.add("is-hidden");
  hideQuizSections();
}

function shuffleArray(items) {
  const array = [...items];

  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }

  return array;
}

function startQuestionSession(mode = "practice") {
  quizMode = mode;
  quizQueue = shuffleArray(questionsBank.map((question) => question.id));
  quizAnsweredCount = 0;
  awaitingSessionRestartChoice = false;
}

function getQuestionById(questionId) {
  return questionsBank.find((question) => question.id === questionId) || null;
}

function getNextQuizQuestion() {
  const nextQuestionId = quizQueue.shift();
  return typeof nextQuestionId === "number" ? getQuestionById(nextQuestionId) : null;
}

function openNextQuestion() {
  if (!quizQueue.length) {
    awaitingSessionRestartChoice = true;
    hideQuizSections();
    quizResult.classList.remove("is-hidden");
    quizResult.classList.add("is-success");
    quizResult.classList.remove("is-error");
    quizDialog.classList.remove("is-success", "is-error");
    quizResultText.textContent = `Voce respondeu as ${quizAnsweredCount} questoes. Deseja recomecar ou voltar a pagina principal?`;
    quizResultNext.textContent = "Recomecar perguntas";
    return;
  }

  const nextQuestion = getNextQuizQuestion();

  if (nextQuestion) {
    renderQuestion(nextQuestion);
  }
}

function renderQuestion(question) {
  activeQuestion = question;
  pendingAnswer = null;
  awaitingSessionRestartChoice = false;
  quizPanel.classList.remove("is-hidden");
  hideQuizSections();
  resetQuizFeedback();
  quizQuestionBlock.classList.remove("is-hidden");
  quizLoading.classList.add("is-hidden");
  quizCounter.textContent = `Questao ${question.id} de 40`;
  quizQuestionText.textContent = question.prompt;
  quizOptions.innerHTML = "";

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.dataset.letter = option.letter;
    button.innerHTML = `<strong>${option.letter})</strong> ${option.text}`;
    button.addEventListener("click", () => {
      pendingAnswer = option.letter;
      [...quizOptions.children].forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      quizConfirmText.textContent = `Voce tem certeza disso? Resposta marcada: ${option.letter}.`;
      quizConfirm.classList.remove("is-hidden");
    });
    quizOptions.appendChild(button);
  });
}

function showQuizResult(isCorrect) {
  quizConfirm.classList.add("is-hidden");
  quizResult.classList.remove("is-hidden");
  quizResult.classList.toggle("is-success", isCorrect);
  quizResult.classList.toggle("is-error", !isCorrect);
  quizDialog.classList.remove("is-success", "is-error");
  void quizDialog.offsetWidth;
  quizDialog.classList.add(isCorrect ? "is-success" : "is-error");
  quizResultNext.textContent = "Continuar respondendo";

  if (isCorrect) {
    quizQuestionBlock.classList.add("is-hidden");
    quizAnsweredCount += 1;
    quizResultText.textContent = quizMode === "skip"
      ? "Parabens! Resposta correta. Voce ganhou a chance de jogar."
      : "Parabens! Resposta correta.";
    return;
  }

  [...quizOptions.children].forEach((button) => {
    const isSelected = button.dataset.letter === pendingAnswer;
    const isAnswer = button.dataset.letter === activeQuestion.correct;

    button.disabled = true;
    button.classList.remove("selected");
    button.classList.toggle("is-wrong", isSelected && !isAnswer);
    button.classList.toggle("is-correct", isAnswer);
  });

  quizAnsweredCount += 1;
  quizResultText.textContent = `Resposta incorreta. A alternativa correta e ${activeQuestion.correct}.`;
}

function openSkipChallenge() {
  if (!questionsBank.length) {
    quizPanel.classList.remove("is-hidden");
    hideQuizSections();
    resetQuizFeedback();
    quizLoading.classList.remove("is-hidden");
    quizLoading.textContent = "As perguntas ainda nao estao disponiveis.";
    return;
  }

  startQuestionSession("skip");
  openNextQuestion();
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
  closeQuizPanel();

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

  if (card.icon === "skip") {
    stopTimer();
    currentTimerDuration = nextTimerDuration;
    updateTimerVisual(nextTimerDuration, "idle");
    timerStatus.textContent = "Carta Pular sorteada. Responda a pergunta para ganhar a chance de jogar.";
    window.setTimeout(openSkipChallenge, 360);
    return;
  }

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
initializeQuestions();

quizConfirmYes.addEventListener("click", () => {
  if (!activeQuestion || !pendingAnswer) {
    return;
  }

  showQuizResult(pendingAnswer === activeQuestion.correct);
});

quizConfirmNo.addEventListener("click", () => {
  pendingAnswer = null;
  quizConfirm.classList.add("is-hidden");
  [...quizOptions.children].forEach((item) => item.classList.remove("selected"));
});

quizResultNext.addEventListener("click", () => {
  if (awaitingSessionRestartChoice) {
    startQuestionSession(quizMode);
    openNextQuestion();
    return;
  }

  openNextQuestion();
});

quizResultHome.addEventListener("click", () => {
  closeQuizPanel();
});

openQuestionsButton.addEventListener("click", () => {
  stopTimer();
  currentTimerDuration = nextTimerDuration;
  updateTimerVisual(nextTimerDuration, "idle");
  timerStatus.textContent = "Modo de perguntas aberto diretamente pela pagina principal.";

  if (!questionsBank.length) {
    openSkipChallenge();
    return;
  }

  startQuestionSession("practice");
  openNextQuestion();
});

drawButton.addEventListener("click", () => {
  const card = getRandomCard();
  animateDraw(card);
});
