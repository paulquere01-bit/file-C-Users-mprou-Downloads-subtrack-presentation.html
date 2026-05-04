const GOAL_COPY = {
  education: {
    label: "education",
    opening: "La plupart des gens compliquent ce sujet. Pourtant, le probleme est souvent plus simple.",
    promise: "Je vais vous montrer une facon plus claire de l'aborder.",
    cta: "Si vous voulez la checklist, commentez \"systeme\".",
  },
  authority: {
    label: "autorite",
    opening: "Voici une conviction que je repete souvent aux dirigeants que j'accompagne.",
    promise: "Elle change la facon de prendre la parole sur LinkedIn.",
    cta: "Si vous voulez que je detaille la methode, dites-le en commentaire.",
  },
  lead: {
    label: "acquisition",
    opening: "Si vos posts LinkedIn ne generent pas d'opportunites, ce n'est pas forcement un probleme de talent.",
    promise: "C'est souvent un probleme de systeme.",
    cta: "Commente \"audit\" si tu veux recevoir la checklist d'acquisition LinkedIn.",
  },
  story: {
    label: "storytelling",
    opening: "J'ai longtemps pense que le probleme venait de l'algorithme. En realite, il venait de mon message.",
    promise: "Le jour ou j'ai change mon angle, les conversations ont change aussi.",
    cta: "Vous avez deja vecu ca ? Racontez-moi votre experience.",
  },
  launch: {
    label: "lancement",
    opening: "On vient de lancer quelque chose qui peut faire gagner beaucoup de temps.",
    promise: "Mais je ne veux pas seulement vous parler de fonctionnalites.",
    cta: "Envoyez-moi un message si vous voulez le tester en avant-premiere.",
  },
};

const TONE_LINES = {
  linora: "Pas avec de la motivation. Avec un systeme simple, repetable et facile a tenir.",
  direct: "Pas de theorie inutile. Juste ce qui cree un vrai signal.",
  storytelling: "Au debut, je pensais qu'il fallait publier plus. Puis j'ai compris qu'il fallait publier mieux.",
  expert: "Le sujet n'est pas la motivation. Le sujet, c'est la qualite du systeme.",
  contrarian: "Le probleme, ce n'est pas que LinkedIn est sature. C'est que la plupart des posts se ressemblent.",
  friendly: "La bonne nouvelle : ce n'est pas reserve aux createurs ultra-inspires.",
};

const LENGTH_BLOCKS = {
  short: 4,
  medium: 6,
  long: 8,
};

const CONTENT_ANGLES = [
  "probleme cache",
  "avant/apres",
  "croyance a casser",
  "systeme simple",
  "erreur couteuse",
  "preuve client",
  "checklist actionnable",
];

const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function clean(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `post_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function sentenceCase(value) {
  const text = clean(value);
  if (!text) {
    return "";
  }

  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function normalizeLine(value) {
  return clean(value).replace(/\s+/g, " ");
}

function extractKeywords(topic, audience) {
  const words = `${topic} ${audience}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]{4,}/g);

  return Array.from(new Set(words || [])).slice(0, 3);
}

function buildHashtags(topic, audience, goal) {
  const goalTag = goal === "lead" ? "#Acquisition" : goal === "launch" ? "#Lancement" : "#LinkedIn";
  const keywordTags = extractKeywords(topic, audience).map((word) => `#${word}`);

  return Array.from(new Set(["#LinkedIn", goalTag, "#PersonalBranding", ...keywordTags])).slice(0, 5);
}

function buildPainBlock(audience, topic) {
  return [
    `La plupart des ${audience} font la meme erreur :`,
    "- ils publient quand ils ont le temps",
    "- ils parlent trop vite de leur offre",
    "- ils copient des formats qui ne leur ressemblent pas",
    "- puis ils esperent que l'algorithme fasse le reste",
    "",
    `Spoiler : ca ne marche pas pour ${topic}.`,
  ].join("\n");
}

function buildSystemBlock(topic, audience, details) {
  const optionalDetail = details ? `\n\nDans votre cas, il faut aussi integrer : ${details}.` : "";

  return [
    "Un bon post client se pilote avec :",
    "-> une accroche qui nomme le probleme",
    "-> une tension que le lecteur reconnait",
    "-> une idee simple a retenir",
    "-> une preuve ou un exemple concret",
    "-> une invitation naturelle a discuter",
    "",
    `C'est exactement ce qu'il faut construire pour ${audience} autour de : ${topic}.${optionalDetail}`,
  ].join("\n");
}

function buildOfferBridge(goal, audience) {
  if (goal === "lead") {
    return `Si LinkedIn doit devenir un canal d'acquisition pour ${audience}, il ne faut pas plus de posts. Il faut de meilleurs signaux.`;
  }

  if (goal === "launch") {
    return `Si vous voulez lancer sans crier dans le vide, commencez par montrer le changement concret pour ${audience}.`;
  }

  if (goal === "story") {
    return `Une histoire fonctionne quand ${audience} se reconnait dans le probleme avant de decouvrir la solution.`;
  }

  return `Quand ${audience} comprend le probleme, la valeur devient beaucoup plus facile a vendre.`;
}

function buildPostSections({ topic, audience, details, goal, tone, length }) {
  const goalCopy = GOAL_COPY[goal] || GOAL_COPY.lead;
  const blockLimit = LENGTH_BLOCKS[length] || LENGTH_BLOCKS.medium;
  const baseSections = [
    `Si ton dernier post LinkedIn a fait moins de 500 vues, ce n'est pas un probleme d'algorithme.\nC'est un probleme de systeme.`,
    `${goalCopy.opening}\n${goalCopy.promise}`,
    `Tu ne rates pas LinkedIn parce que ton marche est trop petit.\nTu le rates parce que ton message n'est pas encore assez net.`,
    buildPainBlock(audience, topic),
    TONE_LINES[tone] || TONE_LINES.direct,
    buildSystemBlock(topic, audience, details),
    buildOfferBridge(goal, audience),
    `Concretement, le prochain post doit faire trois choses :\n1. attirer la bonne personne\n2. lui faire dire "c'est exactement mon probleme"\n3. lui donner envie de parler avec vous`,
    `C'est comme ca qu'un post passe de contenu visible a contenu qui cree des clients.`,
  ];

  return baseSections.slice(0, blockLimit);
}

export function generateLinkedInPost(input) {
  const topic = normalizeLine(input?.topic);
  const audience = normalizeLine(input?.audience);
  const goal = clean(input?.goal, "lead");
  const tone = clean(input?.tone, "direct");
  const length = clean(input?.length, "medium");
  const details = normalizeLine(input?.details);

  if (!topic) {
    throw new Error("Le sujet est obligatoire pour generer un post.");
  }

  if (!audience) {
    throw new Error("L'audience est obligatoire pour generer un post.");
  }

  const goalCopy = GOAL_COPY[goal] || GOAL_COPY.lead;
  const hook = `${sentenceCase(topic)} : le vrai probleme n'est pas de publier plus.`;
  const body = buildPostSections({ topic, audience, details, goal, tone, length }).join("\n\n");
  const hashtags = buildHashtags(topic, audience, goal);
  const post = `${hook}\n\n${body}\n\n${goalCopy.cta}\n\n${hashtags.join(" ")}`;

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    brief: {
      topic,
      audience,
      goal,
      tone,
      length,
      details,
    },
    hook,
    body,
    cta: goalCopy.cta,
    hashtags,
    post,
  };
}

export function generateContentCalendar(input, count = 7) {
  const topic = normalizeLine(input?.topic) || "transformer LinkedIn en canal client";
  const audience = normalizeLine(input?.audience) || "votre audience";
  const goal = clean(input?.goal, "lead");
  const itemCount = Math.max(1, Math.min(Number(count) || 7, 30));
  const goalCopy = GOAL_COPY[goal] || GOAL_COPY.lead;

  return Array.from({ length: itemCount }, (_, index) => {
    const angle = CONTENT_ANGLES[index % CONTENT_ANGLES.length];
    const day = WEEK_DAYS[index % WEEK_DAYS.length];

    return {
      day,
      angle,
      title: `${sentenceCase(angle)} : ${topic}`,
      objective: `Creer un post ${goalCopy.label} pour ${audience}`,
      prompt: `Racontez ${topic} sous l'angle "${angle}" avec une accroche forte, une tension client et une invitation a discuter.`,
      cta: `Inviter ${audience} a demander la checklist ou un audit.`,
    };
  });
}

export function formatPostForDisplay(result) {
  if (!result?.post) {
    return "";
  }

  return result.post;
}
