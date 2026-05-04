const GOAL_COPY = {
  education: {
    label: "education",
    hook: "La plupart des gens compliquent ce sujet, alors qu'il peut devenir simple.",
    cta: "Quel conseil ajouteriez-vous a cette liste ?",
  },
  authority: {
    label: "autorite",
    hook: "Voici une conviction que je repete souvent a mes clients.",
    cta: "Si vous voulez que je detaille ma methode, dites-le en commentaire.",
  },
  lead: {
    label: "generation de leads",
    hook: "Si vous essayez d'obtenir plus d'opportunites, commencez par ce diagnostic.",
    cta: "Commentez \"audit\" si vous voulez recevoir la checklist.",
  },
  story: {
    label: "storytelling",
    hook: "J'ai longtemps pense que le probleme venait de l'algorithme. En realite, il venait du message.",
    cta: "Vous avez deja vecu ca ? Racontez-moi votre experience.",
  },
  launch: {
    label: "lancement",
    hook: "On vient de lancer quelque chose qui peut faire gagner beaucoup de temps.",
    cta: "Envoyez-moi un message si vous voulez le tester en avant-premiere.",
  },
};

const TONE_COPY = {
  direct: "Soyez concret, evitez le jargon et donnez une prochaine action claire.",
  storytelling: "Racontez le contexte, la tension, puis la lecon apprise.",
  expert: "Cadrez le probleme, partagez un raisonnement et montrez votre methode.",
  contrarian: "Remettez en question une idee recue sans devenir agressif.",
  friendly: "Gardez un ton accessible, humain et encourageant.",
};

const LENGTH_LINES = {
  short: 3,
  medium: 5,
  long: 7,
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
  if (!text) {
    return "";
  }

  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function splitTopic(topic) {
  return clean(topic)
    .split(/[.!?\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildBodyLines({ topic, audience, details, goal, tone, length }) {
  const lines = [];
  const topicParts = splitTopic(topic);
  const mainTopic = sentenceCase(topicParts[0] || topic);
  const targetAudience = clean(audience, "votre audience");
  const detailText = clean(details);
  const wantedLines = LENGTH_LINES[length] || LENGTH_LINES.medium;

  lines.push(`${mainTopic}.`);
  lines.push(`Pour ${targetAudience}, le vrai enjeu n'est pas de publier plus, mais de publier avec un angle clair.`);

  if (goal === "lead") {
    lines.push("Le signal le plus fort vient souvent d'un post qui nomme un probleme precis et propose une prochaine etape simple.");
  } else if (goal === "launch") {
    lines.push("Un bon lancement ne liste pas seulement des fonctionnalites : il montre le changement concret pour l'utilisateur.");
  } else if (goal === "story") {
    lines.push("Le declic arrive quand vous reliez une experience personnelle a une lecon utile pour le lecteur.");
  } else {
    lines.push("La difference se joue dans la clarte : un probleme, une idee, une action.");
  }

  lines.push(`Angle recommande : ${TONE_COPY[tone] || TONE_COPY.direct}`);

  if (detailText) {
    lines.push(`A integrer : ${detailText}.`);
  }

  lines.push("Structure simple a utiliser :");
  lines.push("1. Decrivez le probleme en une phrase.");
  lines.push("2. Partagez ce que vous avez appris.");
  lines.push("3. Terminez avec une question qui lance la conversation.");

  return lines.slice(0, wantedLines + 2);
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

  return Array.from(new Set(["#LinkedIn", goalTag, ...topicalTags])).slice(0, 5);
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

  const goalCopy = GOAL_COPY[goal] || GOAL_COPY.education;
  const hook = `${goalCopy.hook}\n\nSujet : ${sentenceCase(topic)}`;
  const body = buildBodyLines({ topic, audience, details, goal, tone, length }).join("\n\n");
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
  const topic = clean(input?.topic, "votre expertise");
  const audience = clean(input?.audience, "votre audience");
  const goal = clean(input?.goal, "education");
  const itemCount = Math.max(1, Math.min(Number(count) || 7, 30));

  return Array.from({ length: itemCount }, (_, index) => {
    const angle = CONTENT_ANGLES[index % CONTENT_ANGLES.length];
    const day = WEEK_DAYS[index % WEEK_DAYS.length];
    const goalCopy = GOAL_COPY[goal] || GOAL_COPY.education;

    return {
      day,
      angle,
      title: `${sentenceCase(angle)} : ${topic}`,
      objective: `Creer un post ${goalCopy.label} pour ${audience}`,
      prompt: `Expliquez ${topic} sous l'angle "${angle}" avec un exemple concret et une question finale.`,
      cta: `Inviter ${audience} a partager son experience.`,
    };
  });
}

export function formatPostForDisplay(result) {
  if (!result?.post) {
    return "";
  }

  return result.post;
}
