import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  generateAutomaticCampaign,
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

  it("creates an automatic campaign with scheduled posts and follow-up actions", () => {
    const campaign = generateAutomaticCampaign({
      topic: "creer un SaaS sans backend",
      audience: "independants",
      goal: "authority",
      tone: "expert",
      length: "short",
    });

    assert.equal(campaign.posts.length, 7);
    assert.match(campaign.summary, /7 posts LinkedIn/);
    assert.match(campaign.posts[0].scheduledAt, /Lundi/);
    assert.match(campaign.posts[0].post, /creer un SaaS sans backend/i);
    assert.equal(campaign.posts[0].automationChecklist.length, 3);
    assert.ok(campaign.nextActions.length > 0);
  });
});
