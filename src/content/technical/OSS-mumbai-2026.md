---
title: "I Went to Open Source Summit India and My Brain Is Still Processing"
date: "2026-06-22"
tags: [open-source, linux-foundation, ossi26, conference, india]
description: "Two days at Open Source Summit India 2026 in Mumbai. Linus Torvalds, AI slop, quantum-safe TLS, and a line I can't stop thinking about."
---

Mumbai, June 16-17, 2026. Two days. More talks than I could attend. More ideas than I could hold.

*I was sponsored to attend by the Linux Foundation. Grateful doesn't quite cover it.*

I'm still figuring out what to do with all of it.

---

Open Source Summit India is one of those events you think you understand before you go. "It's a conference. People talk about open source. You take notes, drink too much coffee, come back with some new GitHub tabs open." That's what I thought.

What I didn't expect was to walk away questioning what open source even *means* anymore.

OSSI runs multiple tracks simultaneously - Linux kernel, security, AI, community, DPI, and more. You're constantly making choices about what to miss. These are the sessions I caught, and what stayed with me from each.

---

## Keynote: From Consumption to Global Leadership

The opening set a tone I didn't expect.

India took **#2 in the world for open source contributions** last year, and we're the fastest growing OSS developer base on the planet.

I let that sit for a second. We're not just users of the global commons anymore. We're builders of it.

And India-specific OSS is growing too - UPI, NMDC, DigiYatra, the whole Digital Public Infrastructure story is quietly becoming something India is *exporting* to the world. Bhutan runs UPI now. AYANWORKS built a reusable KYC system called AYAANWORKS that other countries are adopting.

That framing - from consumption to global leadership - hung over everything else that followed.

---

## Keynote: Linus Torvalds and Dirk Hohndel in Conversation

I'll be honest: this was the session I was most curious about. And it didn't disappoint.

Linus apparently hates public speaking. He only agreed to the fireside format because it didn't feel like a stage. And once he was comfortable, he just... talked. Plainly. Without the corporate layer most speakers put on.

A few things stuck with me:

He still uses **Git and email**. That's it. His whole world runs on two tools that are decades old. When asked about this, he said something like "I work with people, not tools." I've been thinking about that ever since.

On AI-generated pull requests - he mentioned that many last-minute merge requests came in because of AI-assisted coding, and he had to hold them off for the next release. Not because AI is useless, but because **AI still wastes developer effort with hallucinated bug reports**. The good ones had a human going through the LLM's output first, cleaning it up, and then interfacing with the maintainers. That's why he required a human to take responsibility. The machine can help, but someone still has to sign their name on it.

On Rust vs C - his analogy was the best thing I heard all week. C is a chainsaw. Rust is a CNC machine. And Linus? "I'm a chainsaw kinda guy." He appreciates Rust for what it catches - it forces fresh eyes onto patterns that C programmers have quietly tolerated for decades. But he also made the point that **Rust fixes easy bugs. It doesn't fix logic issues.** Some of the most recent kernel vulnerabilities were logic bugs. No type system catches those.

And then he said this, in the middle of talking about merge requests and contributor dynamics:

> **"Code is easy to fix, personality is not."**

One sentence. He moved on. But the room didn't.

I keep turning that over. How much of open source health is actually a people problem wearing a technical costume? How many projects have died not because the code was bad, but because someone with commit access had an ego? How many good contributors have just quietly left?

Code is fixable. Personality - that's long-term work.

---

## Session: Open Source Is Not the Same Anymore

There was a session that put a name to something I've been vaguely sensing for a while.

Curl shut down its bug bounty because of **AI spam**. Jazzband shut down because of **AI slop** - apparently AI-assisted PRs were generating 1.7x more issues. Terraform and Redis pulled rug-switches on their licenses. Synadia tried to reclaim the NATS trademark from CNCF. CockroachDB went BSL, citing AWS as a competitive threat.

The pattern: **devaluation of license and community.**

The speaker broke down what you should actually look at when evaluating whether a project is trustworthy:

1. Is the license OSI-approved? Any non-compete or geographic restriction buried in there?
2. Who actually writes the code? If two or three people disappeared tomorrow, does the project survive?
3. Is governance written down somewhere - a GOVERNANCE file, a CHARTER?
4. How does the project treat newcomers? First human response time to an external PR is a real signal.
5. Where's the trademark? Who owns the domain? Who controls the GitHub org?

That last one is deceptively important. The real power in a project sometimes lives in who controls the `.io` domain, not who wrote the most code.

---

## Session: Blackbox LLM Benchmarking

This one was dense but worth staying for. The talk was specifically about benchmarking black-box AI models for legal reasoning, and the findings were more broadly applicable than they might sound.

The core finding: when you do RAG (retrieval-augmented generation) with only statutes and no case law, the model gets the rule but not the exceptions. And incomplete retrieval *overrides* the pre-training. They saw a **9-point benchmark decline** from statute-only RAG vs no RAG at all.

The term they coined: **Statutory Myopia**. The model gets laser-focused on what it retrieved and misses the override that wasn't surfaced. And this was model-agnostic - it happened across different LLMs regardless of which one they tested.

The risk scales with how much the correct answer depends on something the retrieval missed. Which means **retrieval design is not a backend concern. It's a correctness concern.**

---

## Session: Nurturing Sustainable FOSS Communities

This was the India story I didn't know I needed to hear.

FOSSUnited has a programme called [Forklore](https://forklore.in) - specifically to spotlight FOSS maintainers in India. Because there are critical projects held together by one person, with a bus factor of 1, and nobody outside their city knows their name.

The talk drew a comparison I hadn't heard before - FOSS and the Swadeshi movement. The idea that building your own software commons is a form of self-reliance. India runs on FOSS underneath - the infrastructure is there, the culture around it less so.

FOSSUnited is trying to change that. For individuals and communities they offer platform and finance support. For organisations, they bridge the gap between technical usage and actual contribution back.

IndiaFOSS is coming - September 26-27 in Bangalore. [Mark it.](https://fossunited.org/indiafoss)

---

## Session: Lessons from a $1M Discovery and Funding Experiment

Related but distinct - Zerodha's FLOSS Fund session was about what happens when you actually try to give money to open source projects.

They have a `funding.json` manifest spec ([fundingjson.org](https://fundingjson.org)) for projects to declare their funding needs. The idea is simple: make it easy for companies to find and fund the dependencies they rely on.

In practice, 2025 disbursals were only at 50%. Red tape, project selection issues, fiscal clarity problems on the receiving side. Even the most popular and critical projects are struggling to receive funding cleanly.

The FLOSS Fund is aiming to become community-run over time. Common sense business strategy, as they put it.

---

## Session: Quantum-Safe TLS in Practice

I almost skipped this one. I'm glad I didn't.

No Q-Day yet - probably 10+ years away - but the threat model is "record now, decrypt later." Someone captures your encrypted traffic today, decrypts it once quantum computers are capable enough. That data is already exposed, even if you can't read it yet.

57% of browser-initiated TLS connections already send a post-quantum cryptography key. And if you run a website, yes, you will eventually need to reconfigure. The chain-of-trust infrastructure isn't ready yet, but the clock is running.

The standards to watch: **FIPS 203-205**. And there's a practical constraint worth knowing - TCP has a 14kB limit before asking for an acknowledgment. ML-DSA signature files are 7kB each, which means sending two certificates crosses that limit and adds a round trip. SNOVA is a smaller candidate still being evaluated.

---

## Session: I Didn't Peek and I Can Prove It (Confidential Computing)

Best session title of the event, honestly.

The core gap: data at rest is encrypted, data in transit is encrypted, but data *in use* is in cleartext. A cloud sysadmin can peek. Confidential computing closes that gap by keeping data encrypted even inside memory, decrypting only within the CPU or GPU itself.

What's interesting is the enabling use cases this unlocks. Multi-party Digital Public Infrastructure - where two parties need to compute on shared data without either seeing the other's raw input. Secure SBOM generation. Hyperscaler compute power without the privacy risk.

Nobody buys security technologies because they want to. But "compute at scale without exposing the data" is a real value proposition.

---

## Session: Writing for Machines

This one stung a little.

Developers *feel* 20% faster with AI assistance but are measurably 20% slower. Merge requests growing exponentially, merge rate tanking. Plausible code gets prioritized over correct code. 2.74x more security vulnerabilities in LLM-generated code. The maintainer's inbox becomes the victim.

The speaker's reframe: the new valuable assets aren't the code itself. They're the **constraints, decisions, conventions, and specifications** that shape what the AI produces. A rules file. A specs file. Architecture-first prompting. Human-written test cases as ground truth.

The closer: you are a context engineer now. Add a constraint for every mistake the AI makes.

---

## Session: Rust in the Linux Kernel

A more technical session, but accessible even if you're not deep in kernel work.

The argument for Rust: it catches a class of errors at compile time that C silently allows. Memory lifetime rules, data validation, locking, error handling, type safety. The speaker's estimate was that **80% of Linux kernel CVEs would vanish with Rust**. Android's kernel is already migrating.

The practical reality: writing a driver in Rust meant writing a lot of bindings first. Old code stays in C. New code goes in Rust. The C API is being re-reviewed as a side effect, which is its own kind of benefit.

Rust lets developers focus more on logic because the compiler handles the mechanical safety checks. That's the real shift.

---

## What I'm Still Sitting With

Two days, multiple tracks, more sessions running in parallel than I could ever catch. I made choices about what to attend and missed things I'll probably read someone else's notes about later.

But across everything I did catch, a few threads kept pulling through.

Open source is under pressure from every direction - AI slop flooding inboxes, license rug-pulls, maintainers burning out, funding not reaching the people who need it. And underneath all of it, the question of who actually owns the commons we've all been building on.

And that line from the Linus session. The one he said and moved on from.

*Code is easy to fix, personality is not.*

Maybe that's the thread that ties everything else together. The AI problems, the governance failures, the quality signals going ignored - how much of it is actually a people problem that found a technical surface to live on?

I don't know. I'm still processing.

---

*A huge thank you to the [Linux Foundation](https://linuxfoundation.org) for sponsoring my attendance - it genuinely meant a lot. And thanks to everyone who spoke, organized, or just showed up. If you were there and want to compare notes, you know where to find me.*