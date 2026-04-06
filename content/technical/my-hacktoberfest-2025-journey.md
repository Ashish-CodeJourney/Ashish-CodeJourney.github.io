---
title: "From Overwhelmed to Empowered: My Hacktoberfest 2025 Journey"
date: "2025-10-30"
description: "How diving into Open Source Weekend, Open Source Day, and Akash Network transformed my coding journey during Hacktoberfest."
tags: ["opensource", "hacktoberfest", "community", "learning"]
---

## The Starting Line

October 1st, 2025. Hacktoberfest had just begun, and I was staring at GitHub feeling completely lost. Everyone seemed to know exactly which projects to contribute to and how to craft the perfect pull request. I had been coding for a while, but open source felt like an exclusive club I couldn't access.

Then I asked myself: What problems do I actually care about solving?

That question changed everything.

## Finding My Path: Open Source Weekend

Instead of chasing popular repositories, I looked for projects aligned with my interests. I've always been passionate about community building and making tech more accessible. That's when I found [Open Source Weekend](https://opensourceweekend.org/).

### The Registration Flow Challenge

**The Problem:** New users were abandoning event registration halfway through. The maintainers knew it was a UX issue but weren't sure where the friction was.

**What I Did:** I went through the registration process myself, taking notes on every confusing moment. Then I submitted a PR that added a progress bar, consolidated redundant forms, improved error messages, and added helpful tooltips.

**The Learning:** This was my first time working with their tech stack. I spent an entire Saturday reading contribution guidelines and understanding their architecture. The maintainers were incredibly helpful, pointing me to similar implementations I could reference.

**Key Insight:** Good contributions aren't about showing off skills. They're about solving real user problems. Every line of code I wrote, I kept thinking: Would someone understand this? Would it make their experience better?

### Documentation That Actually Helps

After my first PR merged, I tackled their documentation. It was comprehensive for experienced developers but intimidating for newcomers. I created a "Quick Start" guide with screenshots, common errors and fixes, and explanations of why each step mattered.

Within a week, three new contributors submitted their first PRs, specifically mentioning the guide helped them get started. That felt better than any code contribution.

## Scaling Up: Open Source Day

With experience from Open Source Weekend, I discovered their sister project: [Open Source Day](https://osd.opensourceweekend.org/). This platform scales the weekend concept into day-long, theme-focused events.

### Building for the Organizers

The project needed help with their event organizer dashboard, specifically real-time analytics showing which projects were getting the most activity during events.

This was the most complex contribution I'd tackled. My first PR attempt worked but wasn't scalable. A senior maintainer left detailed feedback explaining why my approach would cause problems as events grew larger.

Initially, I felt defensive. Then I realized this was free mentorship from someone with years more experience. I rewrote the feature using their suggestions, learning about proper state management and efficient data fetching in the process.

**The Breakthrough:** After three rounds of revisions, my PR was merged. But the real victory was understanding I had leveled up as a developer. I could now architect features for scale, not just make things work locally.

**The Meta Moment:** While building tools for Open Source Day, something clicked. I was contributing to a platform that helps people organize events where others contribute to open source. Every feature I built would enable organizers to run better events, which would help more people make their first contributions.

That's when I truly understood the ecosystem nature of open source.

## The Wild Card: Akash Network

Halfway through October, I made a deliberate decision to leave my comfort zone. I wanted to challenge myself with something completely outside my experience: [Akash Network](https://akash.network/).

### Learning a New World

Akash is a decentralized cloud computing marketplace. Anyone with spare computing resources can rent them out, and anyone needing infrastructure can deploy applications without relying on AWS or Google Cloud.

**My First Week:** I didn't contribute any code. I couldn't. I needed to learn. I read documentation, deployed test applications, joined their Discord, and watched tutorials about blockchain basics and container orchestration.

Multiple times I thought about giving up. Everyone seemed to speak a language I didn't understand. But I kept showing up, kept asking questions, and slowly it started making sense.

### Documentation for the Confused

I noticed Akash's documentation was technically accurate but assumed you already understood blockchain and distributed systems. There was a gap between "what is Akash" and "here's how to deploy your first app."

I could fill that gap. I had just crossed that bridge myself.

I created "Deploying Your First App on Akash: A Guide for Web Developers New to Decentralized Infrastructure." It explained blockchain concepts through web development analogies, walked through deployment step-by-step, covered common mistakes I'd made, and provided resources for learning more.

**The Response:** This guide became my most impactful contribution. Several developers commented that it was exactly what they needed. A maintainer suggested incorporating parts into the official documentation.

**What I Learned:** Sometimes the best person to write beginner documentation is someone who just finished being a beginner. You remember what was confusing in ways that experts have forgotten.

### Going Technical

With confidence built, I tackled more technical contributions:

- **Expanded test coverage** for their deployment CLI tool, adding tests for error conditions like invalid configs, network timeouts, and insufficient funds
- **Created deployment helper scripts** that simplified common patterns, letting new users start with templates and modify them as they learned

These weren't glamorous contributions, but they made the tool more reliable for everyone.

## What I Learned

### The Patterns That Emerged

**1. Documentation Is Everyone's Responsibility**  
If something confused me, it would confuse others. Don't just fix your confusion and move on. Document the solution so the next person doesn't hit the same wall.

**2. Small Contributions Multiply**  
Fixing a confusing error message, adding a missing example, improving variable names. These small changes remove friction for potentially hundreds of future contributors.

**3. Community Makes the Difference**  
The projects where I contributed most had welcoming, responsive maintainers who gave constructive feedback, celebrated contributions, and made me feel valued.

**4. Learning Happens in Public**  
Before Hacktoberfest, I would have been embarrassed to submit imperfect code. Now I understand that's the point. My "not great" first attempt at the analytics dashboard taught me more than a dozen perfect solo projects.

### How Hacktoberfest Changed Me

**Before October:** Open source felt like something other people did. Talented developers with computer science degrees. Not me.

**After October:** I see open source as a spectrum of contributions. You don't need to be the best developer. You need to care about solving problems, be willing to learn, communicate clearly, take feedback gracefully, and show up consistently.

I can do all of those things. So can most developers.

### What I Gained

**Technical Skills:** I entered comfortable with frontend development. I'm leaving with experience in backend architecture, blockchain technology, cross-platform development, advanced Git workflows, and performance optimization.

**Network:** I connected with maintainers and contributors worldwide. Some became mentors, others collaborators, a few became friends.

**Perspective:** Contributing to Akash changed how I think about infrastructure. Open Source Weekend and Day taught me technology serves people, not the other way around.

**Confidence:** I trust my ability to figure things out. That confidence extends beyond open source into my day job and life.

## The Challenges

Let me be honest about what was hard:

**Imposter Syndrome:** Every new project, a voice said "you're not good enough." But every merged contribution quieted that voice a little more.

**Time Management:** Balancing contributions with work and life required discipline. I learned to set boundaries. Not every issue needed solving immediately.

**Technical Gaps:** Each concept I needed to learn felt like a mountain to climb. But I climbed them one tutorial at a time, one question in Discord at a time.

**Feedback That Stung:** Being told my code "worked but wasn't maintainable" hurt my pride. But it made me better. I learned to separate my ego from my code.

## Advice for Your First Hacktoberfest

**1. Start With Problems You Care About**  
Find projects that solve problems you actually face. Genuine interest sustains motivation when contributions get difficult.

**2. Read More Than You Think You Need To**  
Spend time understanding the project's goals, contribution guidelines, and codebase structure before submitting PRs.

**3. Start Small, Then Scale**  
My first contribution was fixing a typo. It taught me the PR process and gave me confidence for bigger issues.

**4. Ask Questions Early and Often**  
Every time I hesitated to ask (because it felt too basic), I wasted time going the wrong direction. Maintainers want you to ask questions.

**5. Embrace the Messy Middle**  
Your first PR will probably need revisions. You might make mistakes. That's not failure, that's learning.

**6. Focus on Impact, Not Numbers**  
One meaningful contribution beats ten trivial ones. Quality over quantity.

**7. Plan to Continue After October**  
The best outcome isn't winning prizes. It's finding projects you care enough about to keep contributing.

## Looking Forward

I'm still active in all three projects. Open Source Weekend is planning a major Q4 release I'm part of. I'm helping coordinate a local Open Source Day event. Akash's roadmap includes developer experience improvements I want to contribute to.

**The Most Exciting Next Step:** I'm organizing a local Open Source Weekend event in my city for December. I'm literally using infrastructure I helped build to build more infrastructure for open source contribution. That recursive impact is beautiful.

## What Open Source Means to Me Now

Before Hacktoberfest, open source was free software I used.

Now, open source is:

**A Learning Platform** where I study code from experienced developers and get feedback that makes me better.

**A Community** where people from different backgrounds collaborate toward shared goals.

**A Way to Give Back** to the collective knowledge that made my success possible.

**A Force for Accessibility** that democratizes technology for everyone.

**A Practice of Humility** that reminds me how much I can learn from others.

**An Act of Optimism** betting on a future where we build better things together than alone.

## The Real Prize

Whether this post wins or not, I've already won.

I won when my documentation helped someone make their first contribution.

I won when maintainers trusted me with complex issues.

I won when I stopped seeing myself as an outsider and started seeing myself as a contributor.

I won when I realized open source isn't about being the best developer in the room. It's about making the room better for everyone who enters.

That's what I brought to Open Source Weekend, Open Source Day, and Akash Network this October. That's what I'll bring to every contribution that follows.

## Your Turn

What about you?

If you participated in Hacktoberfest 2025, what projects did you contribute to? What surprised you? What will you keep contributing to after October?

If you're thinking about contributing but haven't started, what's holding you back? What would make taking that first step easier?

Let's talk in the comments. Share your stories, ask your questions, offer your advice. That's how communities grow.

---

*Contributing to open source? Share your journey in the comments. Let's celebrate the community that makes all of this possible.*
