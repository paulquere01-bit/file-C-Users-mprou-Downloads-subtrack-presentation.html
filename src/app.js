import {
  formatPostForDisplay,
  generateContentCalendar,
  generateLinkedInPost,
} from "./postGenerator.js";

const STORAGE_KEY = "postpilot.generations";

const form = document.querySelector("#post-form");
const postOutput = document.querySelector("#post-output");
const calendarOutput = document.querySelector("#calendar-output");
const calendarButton = document.querySelector("#calendar-button");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const clearHistoryButton = document.querySelector("#clear-history-button");

let currentPost = null;
let currentCalendar = [];

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `generation_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getBriefFromForm() {
  const data = new FormData(form);

  return {
    topic: data.get("topic"),
    audience: data.get("audience"),
    goal: data.get("goal"),
    tone: data.get("tone"),
    length: data.get("length"),
    details: data.get("details"),
  };
}

function renderPost(post) {
  currentPost = post;
  postOutput.textContent = formatPostForDisplay(post);
}

function renderCalendar(items) {
  currentCalendar = items;
  calendarOutput.innerHTML = "";

  if (items.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Generez 7 idees pour remplir votre planning.";
    calendarOutput.append(emptyState);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "calendar-item";

    const day = document.createElement("span");
    day.textContent = item.day;

    const title = document.createElement("h4");
    title.textContent = item.title;

    const prompt = document.createElement("p");
    prompt.textContent = item.prompt;

    const objective = document.createElement("small");
    objective.textContent = item.objective;

    card.append(day, title, prompt, objective);
    calendarOutput.append(card);
  });
}

function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveGeneration(post) {
  const history = loadHistory();
  const nextHistory = [
    {
      id: createId(),
      createdAt: new Date().toISOString(),
      post,
    },
    ...history,
  ].slice(0, 20);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const post = generateLinkedInPost(getBriefFromForm());
  renderPost(post);
  saveGeneration(post);
});

calendarButton.addEventListener("click", () => {
  const calendar = generateContentCalendar(getBriefFromForm());
  renderCalendar(calendar);
});

copyButton.addEventListener("click", async () => {
  if (!currentPost) {
    return;
  }

  await navigator.clipboard.writeText(formatPostForDisplay(currentPost));
  copyButton.textContent = "Copie";
  window.setTimeout(() => {
    copyButton.textContent = "Copier";
  }, 1600);
});

downloadButton.addEventListener("click", () => {
  downloadJson(
    {
      post: currentPost,
      calendar: currentCalendar,
      exportedAt: new Date().toISOString(),
    },
    "postpilot-export.json",
  );
});

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  clearHistoryButton.textContent = "Historique efface";
  window.setTimeout(() => {
    clearHistoryButton.textContent = "Effacer l'historique";
  }, 1600);
});

renderCalendar([]);
