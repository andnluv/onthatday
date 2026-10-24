# 그날의 사정 — SillyTavern Extension

**ABO worldbuilding and roleplay state tracking for SillyTavern**

Manage fictional ABO settings for your character (CHAR) and user persona (USER), including cycles, condition, pheromone output, bonding, preferences, pregnancy, and narrative time. The extension works per chat without editing existing character cards.

[한국어 안내](README.md)

## Installation

1. Open **Extension Manager** in SillyTavern.
2. Use **Install Extension** with the public GitHub repository URL provided by the distributor.
3. Refresh SillyTavern after installation.
4. Open **그날의 사정** from the Extensions (wand) menu.

To update an existing installation, use the extension updater and refresh the page. Back up long-running chats before updating.

### Bundled World Info

The release includes `worldinfo/[WI]Geunalui_Sajeong_v1.0.0.json` and a matching rules reference document. You do **not** need to import the JSON separately to use the extension's initial analysis and state tracking. Import it through SillyTavern's World Info interface only if you want the lorebook entries enabled separately.

Check for duplicate active entries if you have already imported the same World Info.

## Features

- **Initial setup and preference analysis:** Review, select, and edit suggested ABO attributes and preference entries based on character cards and user personas. Clear individual manual locks or reset either or both profiles without deleting RP event history.
- **Condition tracking:** Track individual condition and pheromone output values and update them from supported narrative events.
- **Cycle tracking:** Manage heat, rut, and menstruation stages and their narrative-time forecasts. An explicitly ongoing period in the opening is reflected, and start/end events can be recorded manually from the Cycle tab.
- **Medication and pregnancy:** Track fictional suppressants, inducers, contraception, pregnancy-risk events, and pregnancy state, with a pregnancy-display privacy option.
- **Bonding and relationships:** Track marks, relationship effects, separation stress, and changes with configurable bond rules.
- **Preferences and scenes:** Manage preferences, dislikes, and boundaries. The current-scene view focuses on CHAR, with verified USER scene details available separately.
- **Past chat reanalysis:** Recheck past messages for events and elapsed time, preview the results, and apply selected records.
- **Optional Korean display processing:** Translate or refine user-facing labels and descriptions using selectable processing modes.
- **NPC tracking:** Select NPCs and maintain separate records for the active tracking target.

## Getting started

1. Open a roleplay chat and launch **그날의 사정**.
2. Confirm CHAR, USER, or the NPC being tracked, then set ABO attributes.
3. Review and edit initial suggestions before applying them.
4. Continue roleplaying and check the status, cycle, preference, and scene views.
5. For an existing chat, use past-chat state reanalysis or narrative-time synchronization as needed.

## Important notes

- AI analysis, historical reanalysis, and optional translation/postprocessing may require additional model/API calls and incur fees.
- AI suggestions and extracted events may be inaccurate. Review results before applying them.
- USER actions are not inferred solely from character narration. Some USER scene fields may therefore remain unavailable.
- Narrative time is not inferred from message counts alone; ambiguous time passage may need manual confirmation.
- Medication, reproductive, and pregnancy calculations are **fictional ABO roleplay mechanics**, not real medical guidance.

For more detailed World Info rules, see `worldinfo/[WI]Geunalui_Sajeong_v1.0.0.md`.
