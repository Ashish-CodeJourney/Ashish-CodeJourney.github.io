---
title: "I Rewrote My Dotfiles Two Years Later. The Shell Config Was the Smallest Part."
date: "2026-07-16"
description: "In 2024 I called dotfiles the DNA of your development environment. I rebuilt mine this year and the biggest folder wasn't the shell. It was the AI's config. Here's what changed, and what I got wrong."
tags: ["dotfiles", "ai", "claude-code", "workflow", "linux"]
---

Two years ago I wrote a post called *Dotfiles: The Developer Secret to the Perfect Setup*.

It had everything you'd expect. `.bashrc`. `.vimrc`. `.gitconfig`. A section on tmux. A closing line about how the journey of a thousand configurations begins with a single dot, which I still think is a decent line.

I reread it last week. Nothing in it is wrong.

It just felt *small*.

---

## The tree that surprised me

I rebuilt my dotfiles from scratch this year. New repo, symlink-based, one idempotent install script, the whole thing.

When I finished, I ran `tree` on it expecting to feel proud. Instead I sat there for a minute.

```
~/.dotfiles/
├── install.sh
├── zsh/
│   ├── .zshrc
│   └── .p10k.zsh
├── git/
│   └── .gitconfig
├── profile/
│   └── .profile
├── claude/
│   ├── CLAUDE.md
│   ├── settings.json
│   ├── agents/        # 10 of them
│   └── commands/      # 5 slash commands
└── opencode/
    └── opencode.json
```

The shell config, the part that used to be *the entire point*, is four files.

The biggest folder is `claude/`.

I did not plan that. Nobody sits down and decides they're going to write configuration files for a language model.

---

## How it happened without me noticing

Every time Claude Code did something I didn't want, I had two options.

Correct it in the moment. Or write it down.

Correcting it in the moment works exactly once. Writing it down works every session, on every machine, forever.

That's a dotfile. That is the *definition* of a dotfile. I'd been writing dotfiles for months without filing them under "dotfiles."

**`CLAUDE.md` is a `.zshrc` for something that reads English.**

Once that clicked, the rest was inevitable. Of course it goes in the repo. Of course it gets symlinked. Of course it gets version controlled. What was I going to do? Retype my engineering principles on every new machine?

---

## The most boring file does the most work

Everyone wants to talk about the agents. Let me talk about the hook instead.

In `settings.json` there's a PostToolUse hook. After every Write or Edit on a `.ts` or `.tsx` file, two things run:

```
npx prettier --write
npx eslint --fix
```

That's it. That's the whole thing. It fails silently if the project doesn't have them.

Nobody would call this AI. It's a hook. It's plumbing. It is spiritually identical to `alias ll='ls -alF'`.

And it means I have never once typed "please format that" again.

**The most boring thing in the repo saves me the most typing.** That was true in 2024 with aliases and it's true now. Some things don't change.

---

## The agents aren't the interesting part. The process is.

There are ten agents in there: `tdd-guardian`, `ts-enforcer`, `refactor-scan`, `pr-reviewer`, `adr`, a few more. The README lists them all, go look if you want the catalogue.

The interesting part isn't the list. It's the five slash commands, because those are just… my actual week:

- `/plan`: writes a plan doc on a feature branch. No code. Nothing gets written until the thinking is done.
- `/pr`: quality gate. Mutation tests, refactor pass, lint. *Then* it opens the PR.
- `/continue`: after the merge. Pull main, update the plan, cut the next branch.

Read that back without the slashes. That's not an AI workflow. That's how I've worked since before any of these tools existed. Plan, small steps, gate before you ship, resume cleanly.

**I wasn't teaching the AI how to code. I was teaching it how I work.**

That distinction matters more than it sounds. The first one is a losing race. The model is going to know more syntax than me forever. The second one is the only thing I actually own.

---

## Portability meant something different than I thought

The 2024 post had a bullet called **Portability**: new machine, `git clone`, done.

Still true. But it turns out portability now means something I didn't anticipate.

`opencode.json` points at the same `CLAUDE.md`. The same agents. The same skills. Two completely different tools, one a CLI and one a TUI, different vendors, different everything. Both reading one set of files and behaving the same way.

Claude Code today. Something else next year. Probably something that doesn't have a name yet.

The config outlives the tool.

That's the real argument for keeping any of this in a dotfiles repo instead of clicking around in each tool's settings. **Version control was never really about backup. It was about not being owned by a tool.** I wrote that bullet in 2024 thinking about Vim. Turns out it was load-bearing for something much bigger.

---

## The uncomfortable part

Three things I'd rather not say but the post is dishonest without them.

**Most of this isn't mine.** The whole Claude/OpenCode framework (the agent structure, the commands, the shape of it) came from [citypaul's dotfiles](https://github.com/citypaul/.dotfiles). Web quality skills from Addy Osmani. Design skills from pbakaus. `grill-me` from Matt Pocock. I assembled this. I didn't invent it. The README credits all of it, and I'd rather say it out loud here too, because there's a version of this post that quietly implies I built a system. I curated one. Those are different jobs.

**I have 32 skills installed and I don't use 32 skills.** Not close. Some of them I installed because they looked interesting and I have never loaded them once. That's config debt. It's real, it's just cheaper than code debt, so nobody writes blog posts about it. I'll prune eventually. Probably not this week.

**And there's a failure mode here I've lived through before.** Where tuning the setup quietly becomes a substitute for doing the work. Where the repo is beautiful and the actual project hasn't moved in a week. I've been that person with Vim configs, and the AI version of it is more seductive because it *feels* like leverage.

The check I use now: **if I can't name the specific mistake a rule prevents, the rule shouldn't be there.**

Rules without a scar are decoration.

---

## The line I wrote down and then ignored

At Open Source Summit India last month there was a session called *Writing for Machines*. It closed on this:

> You are a context engineer now. Add a constraint for every mistake the AI makes.

I wrote it in my notes. I nodded. I moved on.

Then I got home, opened my dotfiles, and realized I'd been doing exactly that for months. Just without a name for it, and therefore without doing it deliberately.

And in the Linus session at the same event, on AI-generated pull requests: the ones that worked had a human going through the output first, cleaning it up, taking responsibility for it. He *required* that. The machine can help. Someone still signs their name on it.

That's what `CLAUDE.md` actually is, when I'm honest about it.

It's me signing my name on how the machine behaves. Before it does anything, not after. **Not automation. Accountability, written down in advance.**

---

## What I'd tell 2024 me

I called dotfiles "the DNA of your development environment." I like that line. I'd change one word.

They're the DNA of your development **process**.

The environment is what it looks like. The process is what it *does*. In 2024 those were basically the same thing, because the only thing reading my config was a shell, and a shell does exactly what you type, nothing more. Nothing in `.bashrc` ever made a decision.

Now something reads my config and makes choices.

Same dot. Very different weight.

---

## What I'm still sitting with

The repo is ten commits old. The old dotfiles ran for two years.

This one won't look like this in two more. Half these agents will turn out to be dead ideas. Most of those 32 skills will be gone. There'll be a folder for a tool nobody's built yet, and I'll write a post about how obvious it was in hindsight.

That's fine. That was always the deal.

The 2024 post ended with *your dotfiles evolve as you do*, and out of everything in it, that's the part I got completely right. I just didn't expect them to evolve into something that talks back.

The dot's still there.

It's holding a lot more now.

---

*The repo, if you want to poke at it: [Ashish-CodeJourney/.dotfiles](https://github.com/Ashish-CodeJourney/.dotfiles). Steal whatever's useful. Most of it was borrowed anyway.*

*The 2024 original is [still up](https://ashish-codejourney.github.io/technical/dotfiles-the-developer-secret-to-the-perfect-setup/), unedited. Seemed more honest to leave it that way.*

*Meanwhile we can connect over [LinkedIn](https://www.linkedin.com/in/ashish-codejourney/) or [Twitter/X](https://x.com/codejourney_).*