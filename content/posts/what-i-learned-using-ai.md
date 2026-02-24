---
title: "What I learned using AI - Why the human-in-the-loop matters"
description: "As we move in to a work where AI development is becoming the normal process we need to be vigilant on the output it produces. AI won't tell us when it's not right and keeping the human-in-the-loop is essential."
publishedAt: "2026-02-24"
tags: ["Engineering", "AI", "Process"]
draft: false
---
I recently had a project where, while there wasn't a hard deadline, there was a need for rapid delivery. We had a way of capturing information previously which had already been decommissioned and currently had no way of capturing or updating that information. There was someone who was working on this but they didn't get a chance to finish it before going on honeymoon. I could have on-boarded someone else but by the time they got the accesses, domain knowledge, and context it might have taken too long to do.

Add to that the company had recently decided to go all-in on AINE and SDD and it became an opportunity for me to learn what that was all about. I hadn't previously used AI in anger - sure I'd played with it but not on something going to production and never under a time constraint. It seemed a great opportunity to learn how our engineers might approach things and definitely a chance to understand the journey they'd be going through.

What I learned didn't turn me into some kind of AI expert but it certainly took my naive understanding and turned it into something far more insightful.

## The Speed

I managed to deliver things fast - I'm talking a couple of days for something that would have taken someone a couple of weeks, all while doing my normal day job. Don't get me wrong, it added a lot of overhead to what I was doing and left me stressed for a few days, but I managed to take something that was incomplete, get it into beta, take feedback and build something ready for production in effectively 3 days. Sure it wasn't the biggest feature in the world, but it was able to move faster than I would have otherwise.

Let's also remember that I'm not in the day-to-day of coding any more, so it would have taken me far, far longer than this to try and do myself.

One thing I tried out was using the AI agents to work in parallel. At one point I had three agents working on three different tasks at once, opening three PRs, and dealing with the feedback. This is great for getting tickets moving quicker, but comes with some side-effects.

## The Code Reviews

Being able to produce a mountain of code quickly comes with the challenge of reviewing this code. The application already existed, had it's own syntax choices, architecture, ways of doing things. The AI didn't understand all of the nuances and ways of working so needed close reviews. Producing more code comes at the cost of far more reviews. This causes review fatigue and moves the problem from code production to code review.

As I progressed I was able to give the AI better instructions and get better outcomes. I was using Claude Code and made huge changes to the CLAUDE.md file along the way to ensure I was getting the outcome I wanted earlier, reducing the overhead of the review cycle. Sending the same thing back several times will, of course, increase the overhead of reviews so getting it right first time helps massively.

## AI Won't Tell You When It's Wrong

One of the biggest learnings thoroughout the journey was that AI doesn't tell you when it's made a mistake, either because it doesn't know or because it'll rapidly try and fix it and move on. It's not as intuitive or intelligent to the code-adjacent tasks, such as testing or impact radius of changes. It'll try to take the quick route to get things resolved and move on.

Here are some of the issues I ran in to more than once:

**AI doesn't respect scope.** 

More than once I found that the AI was trying to update things beyond the scope of the feature. This is because things were being re-used, which they should be, but rather than keep some kind of boundary around the feature to keep impact smaller it would update shared components and then NOT update the things that were using that component. Even if it had, the testing scope suddently grew massively and there would have been unforeseen consequences had that been allowed to happen.

**AI skips validation.**

Several times, even with clear instructions in the CLAUDE.md file, I found the AI skipping ahead in a clearly defined process including running linting, tests, and build cycles and instead committing and pushing without those important validation steps. Several times those steps had caught issues in what the AI had produced and so ensuring those steps are run is a must. Some finagling got things to a point where they were happening but by default the AI wouldn't do these things automatically.

**AI can't critically assess feedback.**

When AI gets given information it works with it. It doesn't critically assess if the instruction is correct or good for the overall outcome, it'll just take what it's given and run with it. I used Copilot to review the output from Claude and there were several instances of the feedback being something that a human engineer would have responded to as "Won't Fix" but the AI was eager to address. There were also times when the feedback was dismissed despite it being important to implement, although these were less common.

## What I Learned About Working With AI

AI is a tool and like all tools it takes time to master it. I've improved massively compared to where I was before this experience, started building out my own set of instructions and capabilities for the tool and how I interact with it, and can now work much faster as a result.

It's not possible to completely remove the fact that AI will get it wrong sometimes and won't tell anyone, it'll just happily fix it and move on without long-term learning. It'll reproduce the same mistake again given the same circumstance, so it's important to teach the AI what not to do using things like AGENTS.md (or similar) and what good looks like. The way you interact with the AI isn't static, it's an evolving setup, and the more you work to improve it the better the outcomes you'll get.

Probably most importantly - AI isn't ready for hands-off working. The [human-in-the-loop](https://cloud.google.com/discover/human-in-the-loop) is still massively important and will be for a long time to come.
