import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generateContentCalendar, generateLinkedInPost } from "../src/postGenerator.js";

describe("post generator", () => {
  it("builds a LinkedIn post with hook, body, closer and hashtags", () => {
    const result = generateLinkedInPost({
      topic: "trouver ses premiers clients B2B",
      audience: "fondateurs SaaS",
      goal: "lead",
      tone: "direct",
      length: "medium",
      details: "inclure une question finale",
    });

    assert.ok(result.post.length > 50, "post should have substantial content");
    assert.ok(result.hook.length > 0, "hook should exist");
    assert.ok(result.body.length > 0, "body should exist");
    assert.ok(result.cta.length > 0, "cta should exist");
    assert.ok(result.hashtags.length > 0, "hashtags should exist");
    assert.match(result.post, /#/);
    assert.equal(result.brief.goal, "lead");

    const lines = result.post.split("\n");
    const shortLines = lines.filter((l) => l.length > 0 && l.length < 60);
    assert.ok(
      shortLines.length > lines.filter((l) => l.length >= 60).length,
      "most lines should be short and punchy (viral style)"
    );
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

  it("generates posts with short punchy lines (viral LinkedIn style)", () => {
    const result = generateLinkedInPost({
      topic: "la vente en B2B",
      audience: "freelances",
      goal: "lead",
      tone: "direct",
      length: "long",
    });

    const lines = result.post.split("\n").filter((l) => l.trim().length > 0);
    const avgLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;

    assert.ok(avgLength < 80, `average line length should be short for viral style, got ${avgLength}`);
    assert.ok(lines.length >= 8, `post should have many short lines, got ${lines.length}`);
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

  it("adapts post length based on length parameter", () => {
    const shortPost = generateLinkedInPost({
      topic: "le personal branding",
      audience: "entrepreneurs",
      goal: "education",
      tone: "direct",
      length: "short",
    });

    const longPost = generateLinkedInPost({
      topic: "le personal branding",
      audience: "entrepreneurs",
      goal: "education",
      tone: "direct",
      length: "long",
    });

    assert.ok(
      longPost.post.length > shortPost.post.length,
      "long posts should be longer than short posts"
    );
  });
});
