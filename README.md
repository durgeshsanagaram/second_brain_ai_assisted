## Architecture

A four-part walkthrough in context engineering, built around **mesh** — a Svelte 5 semantic note-graph app that ships with a deliberately empty `CLAUDE.md`. Each part surfaces a different kind of context gap: what `/init` can discover on its own, what only a human can settle (competing patterns), what arrives as a written spec, and what arrives as a design request. The artifact that grows across all four is `CLAUDE.md` itself — the second brain of the title.

### The context loop

```mermaid
flowchart TD
    Empty["📄 CLAUDE.md<br/>starts empty"]

    subgraph P1["Part 1 · Initialize context"]
        Init["/init<br/>Claude reads the codebase"]
        Gap1["Compare what was captured<br/>against what is still missing"]
        Init --> Gap1
    end

    subgraph P2["Part 2 · Audit conventions"]
        Conflict["⚔️ Competing patterns<br/>$state runes vs stores"]
        Canon["📚 mesh-context/conventions/<br/>the canonical answer"]
        Migrate["Write the rule, migrate the code"]
        Conflict --> Canon --> Migrate
    end

    subgraph P3["Part 3 · Build a feature"]
        Spec["📋 mesh-context/search-feature/<br/>senior-engineer search spec"]
        Build["Implement search on the<br/>now-settled conventions"]
        Spec --> Build
    end

    subgraph P4["Part 4 · Apply updates"]
        Email["📥 mesh-context/inbox/<br/>designer asks for an accent refresh"]
        Design["Document the design rules,<br/>propagate the accent color"]
        Email --> Design
    end

    Empty --> Init
    Gap1 -->|"write the gaps down"| Empty
    Migrate -->|"record the convention"| Empty
    Build -->|"record feature decisions"| Empty
    Design -->|"record the design tokens"| Empty
    Empty -.->|"every later part reads it"| P2
    Empty -.-> P3
    Empty -.-> P4

    classDef ctx fill:#fef9c3,stroke:#ca8a04,color:#3b2f04
    classDef step fill:#f3e8ff,stroke:#8b5cf6,color:#1e1b4b
    classDef src fill:#e0f2fe,stroke:#0284c7,color:#0c243b
    classDef work fill:#dcfce7,stroke:#16a34a,color:#052e16

    class Empty ctx
    class Init,Gap1 step
    class Canon,Spec,Email src
    class Conflict,Migrate,Build,Design work
```

### Ask once, write it down, never asked again

```mermaid
flowchart LR
    Q["❓ Claude asks a question<br/>or guesses wrong"]
    Answer["🗣️ Human answers once"]
    Write["✍️ Answer becomes a line<br/>in CLAUDE.md"]
    Auto["✅ Next session already knows"]

    Q --> Answer --> Write --> Auto
    Auto -->|"a question asked twice<br/>is a missing line"| Q

    classDef ask fill:#ffe4e6,stroke:#e11d48,color:#4c0519
    classDef human fill:#f3e8ff,stroke:#8b5cf6,color:#1e1b4b
    classDef doc fill:#fef9c3,stroke:#ca8a04,color:#3b2f04
    classDef win fill:#dcfce7,stroke:#16a34a,color:#052e16
    class Q ask
    class Answer human
    class Write doc
    class Auto win
```

### Where context comes from

```mermaid
flowchart LR
    subgraph Discoverable["Claude can find this alone"]
        Code["mesh/ source<br/>Svelte 5 · JavaScript · CSS"]
    end

    subgraph Human["Only a human can supply this"]
        Conv["conventions/<br/>which pattern wins"]
        SpecSrc["search-feature/<br/>what to build"]
        Inbox["inbox/<br/>what the designer wants"]
    end

    Brain["🧠 mesh/CLAUDE.md<br/>the durable second brain"]
    Agent["🤖 Claude Code<br/>+ /init and /assignment_2 skills"]

    Code -->|"/init discovers structure"| Brain
    Conv --> Brain
    SpecSrc --> Brain
    Inbox --> Brain
    Brain --> Agent
    Agent -->|"writes code that already<br/>follows the conventions"| Code

    classDef disc fill:#e0f2fe,stroke:#0284c7,color:#0c243b
    classDef hum fill:#f3e8ff,stroke:#8b5cf6,color:#1e1b4b
    classDef brain fill:#fef9c3,stroke:#ca8a04,color:#3b2f04
    classDef agent fill:#dcfce7,stroke:#16a34a,color:#052e16

    class Code disc
    class Conv,SpecSrc,Inbox hum
    class Brain brain
    class Agent agent
```

The split matters: `/init` is good at what the code already shows — file layout, framework, scripts. It cannot tell you that `$state` runes beat stores, that search should behave a particular way, or which accent color the designer picked. Those three live in `mesh-context/` precisely because they are the kind of knowledge that has to be written down by hand, once.

### The four parts

| Part | The gap it exposes | What you do | What lands in `CLAUDE.md` |
| --- | --- | --- | --- |
| 1 · Initialize context | Nothing is documented | Run `/init`, then audit what it missed | Structure, stack, commands — plus the gaps |
| 2 · Audit conventions | Two patterns compete | Read `conventions/`, pick the canon, migrate | The rule, stated once and enforceably |
| 3 · Build a feature | The spec lives outside the repo | Implement search from the written spec | Feature decisions and their rationale |
| 4 · Apply updates | Design intent lives in an inbox | Document the design rules, propagate the accent color | Design tokens and styling conventions |

### Repository layout

```
mesh/                            Working Svelte 5 app — starts with an empty CLAUDE.md
mesh-context/
├── conventions/                 Canonical patterns that resolve competing approaches
├── search-feature/              Senior-engineer search spec (revealed in part 2)
└── inbox/                       Designer email requesting an accent-color refresh
.claude/skills/assignment_2/     The walkthrough skill
```

Run `/assignment_2` from `mesh/` to start the walkthrough.
