import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  generateAutopilotQueue,
  generateContentCalendar,
  generateLinkedInPost,
} from "../src/postGenerator.js";

describe("post generator", () => {
  it("builds a LinkedIn post with hook, audience, details and hashtags", () => {
    const result = generateLinkedInPost({
      topic: "trouver ses premiers clients B2B",
      audience: "fondateurs SaaS",
      goal: "lead",
      tone: "direct",
      length: "medium",
      details: "inclure une question finale",
    });

    assert.match(result.post, /trouver ses premiers clients B2B/i);
    assert.match(result.post, /fondateurs SaaS/);
    assert.match(result.post, /inclure une question finale/);
    assert.match(result.post, /#/);
    assert.equal(result.brief.goal, "lead");
  });

  it("rejects incomplete briefs", () => {
    assert.throws(
      () =>
        generateLinkedInPost({
          topic: "ameliorer son personal branding",
          audience: "",
        }),
      /audience est obligatoire/,
    );
  });

  it("creates seven calendar ideas with actionable metadata", () => {
    const ideas = generateContentCalendar({
      topic: "automatiser la prospection",
      audience: "consultants",
      goal: "education",
      tone: "expert",
    });

    assert.equal(ideas.length, 7);
    assert.equal(ideas[0].day, "Lundi");
    assert.match(ideas[0].title, /automatiser la prospection/);
    assert.match(ideas[0].objective, /consultants/);
    assert.match(ideas[0].prompt, /exemple concret/);
  });

  it("keeps the requested number of calendar ideas within safe bounds", () => {
    const ideas = generateContentCalendar(
      {
        topic: "ameliorer son contenu LinkedIn",
        audience: "freelances",
        goal: "authority",
      },
      100,
    );

    assert.equal(ideas.length, 30);
  });

  it("creates an automatic queue of ready-to-publish LinkedIn posts", () => {
    const queue = generateAutopilotQueue({
      topic: "vendre une offre SaaS sans equipe commerciale",
      audience: "fondateurs SaaS",
      goal: "lead",
      tone: "expert",
      length: "short",
      details: "inclure un exemple B2B",
    });

    assert.equal(queue.length, 7);
    assert.equal(queue[0].position, 1);
    assert.equal(queue[0].status, "pret a publier");
    assert.equal(queue[1].status, "planifie");
    assert.match(queue[0].post.post, /vendre une offre SaaS/i);
    assert.match(queue[0].post.post, /fondateurs SaaS/);
    assert.match(queue[0].post.post, /angle erreur frequente/i);
  });

  it("requires a complete brief before creating the automatic queue", () => {
    assert.throws(
      () =>
        generateAutopilotQueue({
          topic: "creer un calendrier LinkedIn",
          audience: "",
        }),
      /audience est obligatoire/,
    );
  });
});
