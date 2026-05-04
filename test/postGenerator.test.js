import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  generateAutomationPlan,
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

  it("creates an automatic posting plan for weekdays", () => {
    const plan = generateAutomationPlan(
      {
        topic: "generer des posts LinkedIn automatiquement",
        audience: "fondateurs SaaS",
        goal: "authority",
        tone: "expert",
        length: "short",
        cadence: "weekdays",
        publishTime: "08:30",
      },
      {
        startDate: "2026-05-04",
        windowDays: 7,
      },
    );

    assert.equal(plan.cadence, "weekdays");
    assert.equal(plan.publishTime, "08:30");
    assert.equal(plan.totalPosts, 5);
    assert.equal(plan.items[0].scheduledFor, "2026-05-04T08:30:00");
    assert.equal(plan.items[0].status, "scheduled");
    assert.match(plan.items[0].post.post, /generer des posts LinkedIn automatiquement/i);
  });

  it("caps automatic plans to the selected cadence", () => {
    const plan = generateAutomationPlan(
      {
        topic: "creer un calendrier editorial",
        audience: "consultants",
        cadence: "weekly",
      },
      {
        startDate: "2026-05-04",
        windowDays: 60,
      },
    );

    assert.equal(plan.totalPosts, 5);
    assert.ok(plan.items.every((item) => item.day === "Lundi"));
  });
});
