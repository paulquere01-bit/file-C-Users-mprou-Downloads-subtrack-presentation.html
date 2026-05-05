const HOOKS = {
  education: [
    (topic) => `La majorite des gens echouent sur ${topic}.\nPour une raison simple :`,
    (topic) => `${sentenceCase(topic)} ?\n\nTout le monde en parle.\nPeu de gens le font bien.`,
    (topic) => `J'ai passe des mois a galerrer sur ${topic}.\nPuis j'ai compris un truc simple.`,
  ],
  authority: [
    (topic) => `Personne ne vous le dit.\nMais ${topic}, ca ne fonctionne pas comme vous croyez.`,
    (topic) => `On m'a demande mon avis sur ${topic}.\nVoici ce que je reponds a chaque fois.`,
    (topic) => `${sentenceCase(topic)} ?\n\nJ'ai une conviction forte la-dessus.`,
  ],
  lead: [
    (topic) => `Personne n'aime qu'on lui vende.\nMais tout le monde aime acheter.\n\n${sentenceCase(topic)} :`,
    (topic) => `Vous perdez des opportunites sur ${topic}.\nPas parce que vous etes mauvais.\nParce que vous parlez trop de vous.`,
    (topic) => `Vos prospects s'en fichent de vos features.\nIls veulent savoir une seule chose :\nEst-ce que vous comprenez leur probleme ?`,
  ],
  story: [
    (topic) => `Il y a 6 mois, j'ai tout change sur ${topic}.\nVoila ce qui s'est passe.`,
    (topic) => `J'ai longtemps cru que ${topic} etait une question de talent.\nJ'avais tort.`,
    (topic) => `Le jour ou j'ai arrete de forcer sur ${topic}.\nTout a change.`,
  ],
  launch: [
    (topic) => `On a construit quelque chose.\nPas un outil de plus.\nUne solution a un vrai probleme : ${topic}.`,
    (topic) => `Ca fait des mois qu'on travaille dessus.\n${sentenceCase(topic)} vient de sortir.`,
    (topic) => `J'annonce rarement ce genre de chose.\nMais la, c'est different.\n\n${sentenceCase(topic)}.`,
  ],
};

const BODY_BUILDERS = {
  education: buildEducationBody,
  authority: buildAuthorityBody,
  lead: buildLeadBody,
  story: buildStoryBody,
  launch: buildLaunchBody,
};

const CLOSERS = {
  education: [
    (topic) => `Si tu veux progresser sur ${topic}, arrete de chercher la methode parfaite.\nCommence par appliquer les bases.`,
    (topic) => `Le secret sur ${topic} ?\nIl n'y en a pas.\nJuste de la regularite et du bon sens.`,
  ],
  authority: [
    (topic) => `${sentenceCase(topic)} ne demande pas plus d'efforts.\nJuste une meilleure direction.`,
    () => `Pas besoin de tout reinventer.\nJuste de voir les choses autrement.`,
  ],
  lead: [
    () => `Pas besoin de manipuler.\nPas besoin de forcer.\nPas besoin de closer comme un bourrin.\n\nJuste une chose :\nDire les bonnes verites aux bonnes personnes.`,
    (topic) => `Si tu veux vendre plus sur ${topic}, arrete de parler.\nCommence a comprendre.`,
  ],
  story: [
    () => `Ce jour-la, j'ai compris un truc.\nLe resultat ne vient pas de l'effort.\nIl vient de la clarte.`,
    (topic) => `La lecon ?\n${sentenceCase(topic)} ne se force pas.\nCa se construit, un jour a la fois.`,
  ],
  launch: [
    () => `Si ca vous parle, essayez.\nSi ca ne vous parle pas, ce n'est pas pour vous.\nEt c'est ok.`,
    (topic) => `On ne promet pas la lune.\nJuste un outil qui resout un vrai probleme sur ${topic}.`,
  ],
};

const CTAS = {
  education: [
    "Tu veux que je developpe un de ces points ? Dis-le en commentaire.",
    "Quel point te parle le plus ? Je detaille dans un prochain post.",
  ],
  authority: [
    "D'accord ? Pas d'accord ? Je veux votre avis en commentaire.",
    "Si vous voulez que je detaille ma methode, dites-le moi.",
  ],
  lead: [
    "Commentez \"GO\" si vous voulez que je vous envoie la checklist.",
    "Envoyez-moi un message si vous voulez en discuter.",
  ],
  story: [
    "Vous avez deja vecu ca ?\nRacontez-moi en commentaire.",
    "Ca vous parle ? Partagez votre experience.",
  ],
  launch: [
    "Envoyez-moi un DM si vous voulez tester.",
    "Lien en commentaire pour ceux que ca interesse.",
  ],
};

const TONE_MODIFIERS = {
  direct: { style: "short", emoji: false },
  storytelling: { style: "narrative", emoji: false },
  expert: { style: "structured", emoji: false },
  contrarian: { style: "provoc", emoji: false },
  friendly: { style: "warm", emoji: true },
};

const LENGTH_CONFIG = {
  short: { bodyBlocks: 2, listItems: 3 },
  medium: { bodyBlocks: 3, listItems: 4 },
  long: { bodyBlocks: 4, listItems: 5 },
};

const CONTENT_ANGLES = [
  "erreur frequente",
  "checklist pratique",
  "avant/apres",
  "coulisses",
  "mythe a casser",
  "framework en 3 etapes",
  "mini etude de cas",
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
  if (!text) return "";
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function pickRandom(arr, seed) {
  const index = Math.abs(hashCode(seed)) % arr.length;
  return arr[index];
}

function hashCode(str) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return hash;
}

function extractKeywords(topic) {
  return clean(topic)
    .split(/[\s,.:;!?]+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);
}

function buildEducationBody({ topic, audience, details, length, tone }) {
  const config = LENGTH_CONFIG[length] || LENGTH_CONFIG.medium;
  const keywords = extractKeywords(topic);
  const lines = [];

  if (TONE_MODIFIERS[tone]?.style === "provoc") {
    lines.push(`La majorite des ${clean(audience, "gens")} font la meme erreur.`);
    lines.push(`Ils pensent que c'est une question de quantite.\nAlors que c'est une question de clarte.`);
  } else {
    lines.push(`La majorite des ${clean(audience, "gens")} compliquent les choses.`);
    lines.push(`Ils veulent tout faire en meme temps.\nResultat : rien n'avance.`);
  }

  const mistakes = keywords.slice(0, config.listItems).map((k) => `Ils se focalisent sur ${k}`);
  if (mistakes.length > 0) {
    lines.push(mistakes.join("\n"));
    lines.push(`Et ils s'etonnent que ca ne marche pas.`);
  }

  lines.push(`La verite ?\n${sentenceCase(topic)}, c'est simple quand on a le bon angle.`);

  if (details) {
    lines.push(`A retenir : ${details}.`);
  }

  return lines.slice(0, config.bodyBlocks + 2);
}

function buildAuthorityBody({ topic, audience, details, length, tone }) {
  const config = LENGTH_CONFIG[length] || LENGTH_CONFIG.medium;
  const lines = [];

  lines.push(`Ce n'est pas ce que vous pensez.\nCe n'est pas ${topic} le probleme.`);
  lines.push(`Le probleme, c'est l'approche.`);

  if (TONE_MODIFIERS[tone]?.style === "structured") {
    lines.push(`Voici comment je vois les choses :\n\n– Le cadre compte plus que l'outil\n– La regularite bat l'intensite\n– La clarte bat la complexite`);
  } else {
    lines.push(`Un bon ${clean(audience, "professionnel")} ne pousse pas.\nIl revele.`);
    lines.push(`Il montre a quelqu'un :\n– Ce qui lui coute deja cher\n– Ce qu'il tolere par habitude\n– Ce qu'il pourrait avoir de mieux`);
  }

  if (details) {
    lines.push(details + ".");
  }

  return lines.slice(0, config.bodyBlocks + 2);
}

function buildLeadBody({ topic, audience, details, length, tone }) {
  const config = LENGTH_CONFIG[length] || LENGTH_CONFIG.medium;
  const lines = [];

  lines.push(`La majorite des ${clean(audience, "gens")} vendent mal pour une raison simple :\nIls parlent trop d'eux.`);

  const badList = [
    "Leur produit",
    "Leurs features",
    "Leurs prix",
    "Leur offre",
    "Leur methode",
  ];
  lines.push(badList.slice(0, config.listItems).join("\n"));
  lines.push(`Et ils s'etonnent que personne n'achete.`);

  if (TONE_MODIFIERS[tone]?.style === "provoc") {
    lines.push(`La vente, ce n'est pas convaincre.\nC'est faire se reconnaitre.`);
  } else {
    lines.push(`Un bon vendeur ne pousse pas.\nIl revele.`);
  }

  if (details) {
    lines.push(details + ".");
  }

  return lines.slice(0, config.bodyBlocks + 2);
}

function buildStoryBody({ topic, audience, details, length }) {
  const config = LENGTH_CONFIG[length] || LENGTH_CONFIG.medium;
  const lines = [];

  lines.push(`Pendant des mois, je faisais comme tout le monde.\nJe suivais les "bonnes pratiques".\nResultat : zero.`);
  lines.push(`Puis un jour, j'ai decide de changer d'approche sur ${topic}.`);
  lines.push(`Pas un pivot radical.\nJuste un ajustement de perspective.`);
  lines.push(`Le resultat ?\nPlus de clarte.\nPlus de resultats.\nMoins d'effort.`);

  if (details) {
    lines.push(details + ".");
  }

  return lines.slice(0, config.bodyBlocks + 2);
}

function buildLaunchBody({ topic, audience, details, length }) {
  const config = LENGTH_CONFIG[length] || LENGTH_CONFIG.medium;
  const lines = [];

  lines.push(`Le constat etait simple :\nLes ${clean(audience, "gens")} perdent du temps sur ${topic}.\nTous les jours.`);
  lines.push(`On a construit une solution.\nPas un gadget.\nUn outil qui resout un vrai probleme.`);
  lines.push(`Ce que ca change :\n– Moins de temps perdu\n– Plus de clarte\n– Des resultats mesurables`);

  if (details) {
    lines.push(details + ".");
  }

  return lines.slice(0, config.bodyBlocks + 2);
}

function buildHashtags(topic, audience, goal) {
  const words = `${topic} ${audience}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]{4,}/g);

  const uniqueWords = Array.from(new Set(words || []));
  const topicalTags = uniqueWords.slice(0, 2).map((word) => `#${word}`);
  const goalTag = goal === "lead" ? "#prospection" : goal === "launch" ? "#lancement" : "#linkedin";

  return Array.from(new Set(["#LinkedIn", goalTag, ...topicalTags])).slice(0, 4);
}

export function generateLinkedInPost(input) {
  const topic = clean(input?.topic);
  const audience = clean(input?.audience);
  const goal = clean(input?.goal, "education");
  const tone = clean(input?.tone, "direct");
  const length = clean(input?.length, "medium");
  const details = clean(input?.details);

  if (!topic) {
    throw new Error("Le sujet est obligatoire pour generer un post.");
  }

  if (!audience) {
    throw new Error("L'audience est obligatoire pour generer un post.");
  }

  const seed = `${topic}-${goal}-${tone}`;
  const hooks = HOOKS[goal] || HOOKS.education;
  const hookFn = pickRandom(hooks, seed);
  const hook = hookFn(topic);

  const bodyBuilder = BODY_BUILDERS[goal] || buildEducationBody;
  const bodyLines = bodyBuilder({ topic, audience, details, goal, tone, length });
  const body = bodyLines.join("\n\n");

  const closers = CLOSERS[goal] || CLOSERS.education;
  const closerFn = pickRandom(closers, seed + "closer");
  const closer = closerFn(topic);

  const ctas = CTAS[goal] || CTAS.education;
  const cta = pickRandom(ctas, seed + "cta");

  const hashtags = buildHashtags(topic, audience, goal);

  const post = [hook, body, closer, cta, hashtags.join(" ")].join("\n\n");

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    brief: { topic, audience, goal, tone, length, details },
    hook,
    body,
    cta,
    hashtags,
    post,
  };
}

export function generateContentCalendar(input, count = 7) {
  const topic = clean(input?.topic, "votre expertise");
  const audience = clean(input?.audience, "votre audience");
  const goal = clean(input?.goal, "education");
  const itemCount = Math.max(1, Math.min(Number(count) || 7, 30));

  return Array.from({ length: itemCount }, (_, index) => {
    const angle = CONTENT_ANGLES[index % CONTENT_ANGLES.length];
    const day = WEEK_DAYS[index % WEEK_DAYS.length];
    const goalLabel = goal === "lead" ? "generation de leads"
      : goal === "authority" ? "autorite"
      : goal === "story" ? "storytelling"
      : goal === "launch" ? "lancement"
      : "education";

    return {
      day,
      angle,
      title: `${sentenceCase(angle)} : ${topic}`,
      objective: `Creer un post ${goalLabel} pour ${audience}`,
      prompt: `Expliquez ${topic} sous l'angle "${angle}" avec un exemple concret et une question finale.`,
      cta: `Inviter ${audience} a partager son experience.`,
    };
  });
}

export function formatPostForDisplay(result) {
  if (!result?.post) return "";
  return result.post;
}
