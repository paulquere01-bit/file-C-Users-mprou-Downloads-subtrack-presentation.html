import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  generateAutopilotPlan,
  generateContentCalendar,
  generateLinkedInPost,
} from "../src/postGenerator.js";

describe("post generator", () => {
  it("builds a client-focused LinkedIn post with a human structure", () => {
    const result = generateLinkedInPost({
      topic: "aider les coachs business a trouver leurs clients LinkedIn",
      audience: "coachs business independants",
      goal: "lead",
      tone: "direct",
      length: "medium",
      details: "mettre en avant le manque de systeme et inviter a demander un audit",
    });

    assert.match(result.post, /Si ton dernier post LinkedIn/);
    assert.match(result.post, /coachs business independants/);
    assert.match(result.post, /C'est un probleme de systeme/);
    assert.match(result.post, /mettre en avant le manque de systeme/);
    assert.match(result.post, /Commente "audit"/);
    assert.ok(result.hashtags.includes("#LinkedIn"));
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

  it("creates seven calendar ideas with acquisition metadata", () => {
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
    assert.match(ideas[0].prompt, /accroche forte/);
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

  it("creates an automatic publishing plan with ready-to-publish posts", () => {
    const plan = generateAutopilotPlan(
      {
        topic: "generer des posts LinkedIn automatiquement",
        audience: "fondateurs SaaS",
        goal: "lead",
        tone: "linora",
        details: "positionner le produit comme assistant de contenu autonome",
      },
      {
        cadence: "three_per_week",
        count: 3,
        startDate: "2026-05-04T00:00:00.000Z",
      },
    );

    assert.equal(plan.length, 3);
    assert.equal(plan[0].publishOn, "2026-05-04");
    assert.equal(plan[1].publishOn, "2026-05-06");
    assert.equal(plan[0].cadence, "3 posts par semaine");
    assert.equal(plan[0].status, "pret a publier");
    assert.match(plan[0].post.post, /fondateurs SaaS/);
    assert.match(plan[0].post.brief.details, /angle editorial/);
  });
});
