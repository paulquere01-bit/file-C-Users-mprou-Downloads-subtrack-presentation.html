import {
  formatPostForDisplay,
  generateAutomaticCampaign,
  generateContentCalendar,
  generateLinkedInPost,
} from "./postGenerator.js";

const STORAGE_KEY = "postpilot.generations";

const form = document.querySelector("#post-form");
const postOutput = document.querySelector("#post-output");
const calendarOutput = document.querySelector("#calendar-output");
const calendarButton = document.querySelector("#calendar-button");
const autopilotButton = document.querySelector("#autopilot-button");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const clearHistoryButton = document.querySelector("#clear-history-button");
const autopilotOutput = document.querySelector("#autopilot-output");
const autopilotSummary = document.querySelector("#autopilot-summary");

let currentPost = null;
let currentCalendar = [];
let currentCampaign = null;

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

function renderAutopilot(campaign) {
  currentCampaign = campaign;
  autopilotOutput.innerHTML = "";

  if (!campaign?.posts?.length) {
    autopilotSummary.textContent =
      "Lancez le pilote automatique pour creer 7 posts planifies avec checklist de suivi.";
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Lancez le pilote automatique pour creer une semaine de posts prets a publier.";
    autopilotOutput.append(emptyState);
    return;
  }

  autopilotSummary.textContent = campaign.summary;

  campaign.posts.forEach((post, index) => {
    const card = document.createElement("article");
    card.className = "autopilot-item";

    const meta = document.createElement("div");
    meta.className = "autopilot-meta";

    const badge = document.createElement("span");
    badge.textContent = `Post ${index + 1}`;

    const schedule = document.createElement("strong");
    schedule.textContent = post.scheduledAt;

    meta.append(badge, schedule);

    const title = document.createElement("h4");
    title.textContent = post.title;

    const preview = document.createElement("p");
    preview.textContent = post.hook.replace(/\n+/g, " ");

    const checklist = document.createElement("ul");
    post.automationChecklist.forEach((item) => {
      const action = document.createElement("li");
      action.textContent = item;
      checklist.append(action);
    });

    const useButton = document.createElement("button");
    useButton.className = "ghost-button";
    useButton.type = "button";
    useButton.textContent = "Afficher ce post";
    useButton.addEventListener("click", () => {
      renderPost(post);
      postOutput.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    card.append(meta, title, preview, checklist, useButton);
    autopilotOutput.append(card);
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

autopilotButton.addEventListener("click", () => {
  const campaign = generateAutomaticCampaign(getBriefFromForm());
  renderAutopilot(campaign);
  renderCalendar(campaign.calendar);
  renderPost(campaign.posts[0]);
  saveGeneration(campaign.posts[0]);
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
      campaign: currentCampaign,
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
renderAutopilot(null);
