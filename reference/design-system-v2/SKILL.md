---
name: ludwig-design
description: Use this skill to generate well-branded interfaces and assets for Ludwig (KI-Buchhaltungsassistent für Steuerkanzleien — AI bookkeeping assistant for German tax-advisor offices), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# Ludwig — design skill

Ludwig is a calm, conservative B2B brand for German tax advisors. Voice: „Kompetenz in Ruhe." Always **„Sie"**, all UI in German, no emoji, no buzzwords, no startup tone.

## How to use this skill

1. Read `README.md` — it contains the brand brief, content fundamentals, visual foundations, and iconography.
2. Read `colors_and_type.css` — single source of truth for tokens.
3. Browse `preview/` cards to feel the system at a glance.
4. For new artifacts: copy `assets/` and `colors_and_type.css` into the artifact folder, then build.
5. For app UI: lift components from `ui_kits/app/`. For marketing: `ui_kits/marketing/`.

## Hard rules

- All copy in **German**. Address with **„Sie"**, never „Du".
- **Colors:** only `#1A3A5C` primary, `#3B8FC4` accent, `#2D2D2D` text, `#F4F6F8` soft bg, white. Semantics desaturated (`#3F7A5A`, `#B07B2C`, `#A8403C`). Never gold, never warm, never neon, never gradients.
- **Typography:** Inter (UI/body), Source Serif 4 (editorial display only), JetBrains Mono (account/DATEV codes). Always tabular numerals for money.
- **No emoji** anywhere. Icons via Lucide at 1.5 stroke.
- **No buzzwords.** „prüfen", „freigeben", „vorkontieren" — not „smart", „magic", „power".
- **Modest motion.** 120/180/280 ms with `cubic-bezier(0.2, 0, 0.0, 1)`. No bounces.
- **Cards:** border OR shadow, never both. Radius 4 px standard.

## When invoked without specific guidance

Ask the user what they want to build (slide, mock, prototype, production component). Ask 2–3 clarifying questions. Then build either an HTML artifact (for visuals/mocks) or production code, following the brand rules above.
