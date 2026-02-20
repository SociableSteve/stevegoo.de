---
title: "AI Won't Tell You When It's Wrong"
description: "As we move in to a work where AI development is becoming the normal process we need to be vigilant on the output it produces. AI won't tell us when it's not right and keeping the human-in-the-loop is essential."
publishedAt: "2026-02-20"
category: "process"
tags: ["Engineering", "AI", "Process"]
draft: false
---

# AI Won't Tell You When It's Wrong — Why Human-in-the-Loop Engineering Matters

You've got a project with an impending deadline. Everyone on your team is already focused elsewhere, and there's no one available to pick it up. Even if you could pull someone in, there's not enough time to properly onboard them to the domain and the problem. So you do something you weren't entirely sure you believed in: you turn to AI.

That was me, not long ago. I was naive about what AI-native engineering could actually deliver in practice. Not in demos, not in Twitter threads, but in the messy reality of shipping production software under pressure. But the business need was real, and I saw it as an opportunity to learn first-hand where things were heading. So I went all in. I used Claude Code across the entire development lifecycle: defining and refining GitHub issues, planning implementation, writing code, and handling PR feedback.

What I discovered didn't turn me into an AI evangelist. It turned me into something more useful — someone who understands exactly where AI accelerates the work and where it will quietly drive you off a cliff if nobody's watching.

## What Converted Me

The results were undeniable. Claude estimated the project at 8–10 days for a team of three engineers. I'm sceptical of that number — realistically, a senior dev without AI support could probably have done it in 3–5 days. But here's the thing: I did it in closer to one day. And I'm someone who hasn't been hands-on in the codebase day-to-day. However you benchmark it, that's not an incremental improvement — it's a step change.

And the speed was only part of it. I found myself using Claude for what was essentially requirements engineering — taking a vague product requirement and decomposing it into crisp, well-scoped GitHub issues with clear acceptance criteria. That kind of task definition usually requires someone senior who knows the codebase and the product deeply. The AI couldn't replace that judgement entirely, but it got me 80% of the way there in minutes instead of meetings.

The real unlock, though, was parallelism. Once I had well-defined, non-interacting issues, I could run multiple agents implementing separate tasks simultaneously. I wasn't just working faster — I was working in a way that simply isn't possible for a single engineer, no matter how skilled. That's a different mode of operating entirely.

## But AI Won't Tell You When It's Wrong

So if the speed was that good, why not just let it run? Because along the way, I hit three failure modes that any engineer will recognise.

**AI doesn't respect scope.** When I had Claude help implement features, it consistently tried to work beyond the boundaries of the task. A focused ticket to add a single capability would balloon into refactors, "improvements," and tangential changes that nobody asked for. The AI wasn't being malicious — it was being helpful in the way a junior engineer with no product context is helpful. It saw adjacent code it could "fix" and went for it. Without a human reviewing the plan and the output against the original scope, what should have been a clean, reviewable PR would have become an unmanageable sprawl.

**AI skips the boring parts.** This one genuinely surprised me. Claude would write code and then want to commit — without running the tests, without linting, without even attempting a local build. It treated validation as optional. In a world where we tell engineers that the PR isn't done until CI is green, the AI was ready to ship without checking if the code even compiled cleanly. AI optimises for completion, not correctness. A human in the loop is what turns "done" into "actually done."

**AI has no judgement about feedback.** This was the most nuanced failure. I had GitHub Copilot reviewing PRs, and Claude responding to the review comments. The problem? Claude would eagerly implement fixes for comments that weren't relevant to the change — stylistic nitpicks on untouched code, suggestions that contradicted the architecture. At the same time, it would push back on or dismiss comments that were genuinely important. It couldn't distinguish signal from noise in code review, because it had no context for what mattered in this codebase, for this team, at this moment. That judgement call — which feedback to act on and which to set aside — is fundamentally human.

And running parallel agents introduced its own risks: divergent assumptions, inconsistent patterns across branches, and the ever-present threat of merge conflicts. The human isn't just the quality layer — the human is also the integration layer, making sure the pieces fit together coherently.

## What I Learned About Working With AI

Here's something the failure modes don't capture on their own: I got better at this. The quality of AI output was directly proportional to the quality of my inputs — tighter task definitions, better constraints, more deliberate context. Over time, I refined the process: sharper prompts, clearer boundaries, explicit instructions about what not to touch. The failure modes didn't disappear, but they became less frequent and easier to catch.

That feedback loop is the part most people miss when they talk about AI-native engineering. It's not a static workflow you set up once. It's a practice you develop, where the human gets better at directing the AI and the AI becomes more useful as a result.

## The Reframe

None of this is an argument against using AI in engineering. I ship faster now than I did before. The AI handles volume and velocity in a way that would be impossible for me alone. But every one of those speed gains depends on a human being present — not as a bottleneck, but as the quality layer.

The pattern I've landed on is what I consider AI-Native Engineering: a workflow where AI is deeply embedded in every stage of development, but where a human stays in the loop for the decisions that require judgement, context, and accountability. The human sets the boundaries. The AI writes. The human decides. The AI implements. The human validates. The AI responds to feedback. The human determines which feedback matters.

## What This Means for Engineering Leaders

If you're leading a team and exploring AI integration, here's the honest takeaway: the productivity gains are real, but they're only as good as the human oversight you pair them with. Full automation isn't the goal. Augmented judgement is.

The engineers who will thrive in this landscape aren't the ones who learn to prompt better. They're the ones who know when to trust the output and when to question it — and who build workflows that make that questioning natural and fast.

AI won't tell you when it's wrong. That's your job. And that's exactly why you're still the most important part of the process.
