# PHILOSOPHY.md

## What this project is

A growing repository of places and the trips that sequence them. The places live as their own data — addresses, vibes, attributions, narrative — and trips are sequenced views into the library, not stand-alone documents. A place can appear in many trips over the years; the place's entry accumulates context (who recommended it, when, what they said, when we last visited) while the trips come and go.

The current trip is *France 2026 — Nice to Narbonne*, ten nights east-to-west across the south. The next is the Aquitaine continuation after the train. Beyond those, the library should grow: future Burgundy, future Paris, future Brittany, places mentioned by friends and held for a year before they fit a trip. The app is the surface; the place files are the substance.

The trip is not a generic itinerary. It's an argument structured as a journey — modernism's Mediterranean inheritance, threaded through villages that predate it and outlast it. A cinephile pilgrimage for Nève. A still center at La Celle. The structure carries weight; the meals and the lodging and the geography all have to belong to the structure or they don't belong on the trip.

The lineage of the project, as far as it has one, is Aby Warburg's *Mnemosyne Atlas* (places as nodes that accumulate meaning across time and across associations), Sebald's *Rings of Saturn* (the trip as walking essay, geography as memory), and the Wunderkammer (the curated collection that argues for itself by what's adjacent to what). Apple Maps's drawer pattern is the closest reference for the mobile interaction, but the project doesn't share Apple Maps's tone — Apple is utilitarian, this is editorial.

## Working with Claude

Marcos has chosen to leverage Claude (via chat) as a primary planning collaborator on this project, not just a task executor. Significant time has been spent in conversation establishing the project's aesthetic, editorial voice, and accumulated taste. When Claude Code makes design or content decisions, it should defer to that voice — captured in this document — rather than to defaults.

The owner explicitly prefers more iterations of dialogue over fewer iterations of misaligned work. If a design or content decision is ambiguous, the right move is to ask, not guess. Claude Code sessions should read this file in full before any non-trivial task. CLAUDE.md describes the codebase; this file describes what the project means.

The friction in this project is on the *capture* side of new content, not the processing side. When Marcos texts a quick note ("Sandra recommended Le Petit Nice, Marseille, bouillabaisse"), the workflow is: paste the note into chat with Claude, Claude looks up the address, hours, website, writes the vibe paragraph in the project's voice, formats the recommendation with proper attribution, and produces a complete place entry ready to commit. Marcos reviews and commits. Claude does the structural work; Marcos provides the editorial judgment that decided the place was worth capturing in the first place.

## Editorial register

Sentence case. Paragraphs over bullet points whenever prose can carry the meaning. No emoji, ever — status indicators use typographic marks (`◆ Locked`) or no marker at all. No promotional language, no SaaS marketing tone, no travel-blog superlatives. Restraint over coverage. When in doubt, write less.

The voice should sound considered. Place vibes are short — usually two to four sentences — but those sentences carry weight. Each one is doing a job: identifying what the place is, naming the register it belongs to, signaling what's at stake when you visit. The vibe paragraph for La Celle is "The fulcrum of the trip. 12th-century abbey, country hotel by Alain Ducasse. Lucrèce de Barras suite is the ritual return." Three sentences, three claims, no decoration.

When a description risks slipping into superlative ("a stunning hilltop village with breathtaking views"), it goes generic. The fix is specificity: "Medieval hilltop village. Maeght and Colombe d'Or both here." The specificity is the substance.

## Visual register

ECAL discipline. Inter for body, JetBrains Mono for metadata — dates, durations, codes, labels, any tabular data. Two weights only: 400 regular, 500 medium. Never bold. Tracking tightened on display sizes (-0.025em), loosened on uppercase metadata (+0.10em).

Background is warm cream `#F8F5EF`. Text is warm near-black `#1A1A1A`. Pure white and pure black are deliberately avoided. The cream is reminiscent of French art-book paper; the warm ink sits against it without harshness.

Region colors are landscape-derived, not abstract category colors. Riviera red `#B8553A` is Esterel limestone and Provençal roof tiles. Var olive `#7C8049` is the maquis. Côte Bleue blue `#1B3FA0` is calanque deep water (Klein blue). Luberon ochre `#C8893A` is Roussillon stone. Languedoc green `#3D6E5C` is the garrigue. Sète gray-blue `#7896A6` is the Étang de Thau and oyster shell. The colors mean something; they're not chosen for variety. When a new region enters the library, picking its color is a design conversation, not a grab-bag decision.

No gradients. No shadows beyond the minimum (the place card overlay needs one to lift off the map; the drawer needs one to register as elevated). No rounded-pill marketing buttons; rectangular buttons with thin hairline borders, or filled near-black for primary actions. No emoji icons; navigation arrows are typographic glyphs in dedicated button shapes, status indicators are diamond marks (`◆`).

Hairline borders are 0.5px; full borders are 1px. The 0.5px hairline is the visual grammar of the project — it organizes content into sections without imposing visual weight. When a 0.5px line isn't enough separation, the answer is more whitespace, not a thicker line.

## Editorial taste — what makes a place signal not noise

This is the section that matters most. The architecture, the typography, and the workflow are all infrastructure. What makes the project worth doing is what gets included and what gets rejected — and on what grounds.

A place earns inclusion when it contributes to an argument the trip is making, not when it's individually excellent. A perfectly fine bistrot that doesn't extend an existing thread is noise. A modest café that completes a thought — Camus's grave plus a coffee on the same morning — is signal.

The bar for a place is not "good restaurant in the area." It's "a place with a thesis." La Mercerie isn't on the trip because it's a good Marseille restaurant; it's there because it's a particular contemporary register — sourced, considered, regional but modern — that other contemporary places get measured against. Tuba isn't a lunch; it's the Marseille day's anchor, a meal with a swim, a structural fact of the day. La Celle is not a hotel choice; it's the trip's still center, the night the rest of the planning orbits.

Tourist-density places are rejected almost without exception, even when they're the obvious guidebook move. Vallauris ceramics — rejected for this trip because too compromised by tourism, even though Picasso's pottery legacy makes it the obvious pick. The Cassis harbor restaurants — rejected because they're "mediocre touristic" even though they'd be the obvious lunch spot. The Lourmarin Friday market for this specific trip — rejected because the driving cost outweighs the spectacle, even though it's the village's biggest market day. Notre-Dame de la Garde, the Calanque boat tours, the Vieux-Port restaurant strip — guidebook moves, all rejected.

The pattern: when an obviously-correct guidebook move fails the taste test, the answer is no, and the no is specific to *this* trip's argument, not a generic refusal of tourism.

The cinephile thread for Nève is real but narrow. It's not "see famous filming locations." It's specific: Berri's *Jean de Florette* and *Manon des Sources* map onto Vaugines and Mirabeau, which are five minutes from Lourmarin where we're already staying — so they earn a half-day pilgrimage. Hitchcock's *To Catch a Thief* is filmed at Cours Saleya, which is a morning market in Nice we'd visit anyway. Cocteau gives Santo Sospir if we book ahead. Varda's *La Pointe Courte* is shot in Sète, which is on the trip. Each thread has to earn its place by being either pedagogically useful for Nève or geographically convenient — and ideally both. Random film locations that don't satisfy either criterion are noise.

The modernism arc is the trip's curatorial spine. It runs structurally Cistercian-austerity (Le Thoronet, 12th century) → Eileen Gray's E-1027 → Le Corbusier's Cabanon and Cité Radieuse → Sert's Maeght → Vasarely Foundation. It's an argument about how 20th-century French modernism inherits and transforms a Mediterranean spatial intelligence — Le Corbusier studied Le Thoronet before designing La Tourette. Each site has to belong to the arc. The Vasarely is in because it's the closing chapter (geometry as architecture). Cézanne's atelier was the missing pre-history but it reopens after this trip, so it's gracefully cut and noted. Villa Noailles is the missing first chapter (Mallet-Stevens 1923) and is currently *not* on the trip, which is honest about the trade-off rather than fudged. Frank Gehry's Luma in Arles is interesting but doesn't fit *this* argument and is left for another trip.

For Marseille specifically, the territory is partially vetted. Tuba and La Mercerie are confirmed-loved. Tétro is "cool but not essential" — we'll be back, no need to force it. Maison Empereur is in because it's structurally singular: an eight-generation hardware shop selling everything for living a French domestic life, which is something else entirely than an old store. Vallon des Auffes is in for sunset light; Les Goudes is in because Tuba is there; the corniche is in for the drive. Marseille's tourist-bracket — the Vieux-Port restaurants, the Notre-Dame climb, the Calanque boat tours — is rejected.

Lodging carries proportional weight to its role in the trip. La Celle is the fulcrum, not a hotel choice; everything else orbits the night ritual there. Pavillon de Galon is preferred for the Luberon because it's three rooms and considered, with the Bibi Gex provenance and the classified garden — a qualitative fit, not just another nice country hotel. La Colombe d'Or is the romantic answer for the Riviera; Le Saint-Paul is the modern-luxe alternative; Vence is the practical fallback. Each option has a register, and the trip can survive switching among them but not switching to a generic Riviera resort.

A Sheraton would technically work for "where to sleep" and would be wrong for what the trip is. That's the test: would substituting this for a generic equivalent break the argument? If yes, it's the right kind of place. If no, it's noise.

When friends recommend a place, the question isn't "is it a good place?" — it's "does it sit naturally in the trip's vocabulary?" Sandra's taste has been calibrated through years of shared meals and travel; her recommendations carry weight when they're for things in the project's register. A recommendation from Pierre — a friend who lived in Marseille for years — carries weight when it's for something only a local would know. The friend's identity *is* the trustworthiness signal, which is why preserving attribution by name through the system matters. "Pierre · Marseille local · 2024" weights differently from anonymous reviews, and the project should make that visible.

## What this project is not

Not a generic travel app. Not a SaaS product. Not feature-maximizing. Not optimized for SEO or shareability or virality. Anti-emoji. Anti-bullet-list-where-prose-fits. Anti-marketing-tone. Anti-rounded-pill-button. Anti-photo-grid-as-content. Anti-favorites-feature-without-real-ask. The restraint is the project's signature, and the restraint compounds — every feature not added makes the present features mean more.

When a feature is proposed that conflicts with this register — even a popular, useful feature — the default answer is to push back and ask whether it's actually needed. "Push back and ask" is the meta-feature.

## Threads currently active

The modernism arc as the curatorial spine. The cinephile pilgrimage for Nève (Berri, Hitchcock, Cocteau, Varda, optionally Pagnol if she engages). Lodging-as-argument (La Celle, Pavillon de Galon, the Riviera options as registers). Friends-as-attribution (Sandra, Pierre, others as they're added). The place library as the persistent thing the trips draw from over time.

## Decisions made and why

Six bases over ten nights, never doubling back — pace. The trip can survive busy days but can't survive constant unpacking.

Lourmarin two nights — anchor in the Luberon. The slow day (Day 7) is a structural commitment, not an accident.

La Celle locked first — the still center. The trip was planned around it, not it around the trip.

Multi-trip architecture from the start — the place library is the persistent thing; trips are sequenced views into it. Adding a new trip should require zero app code changes, only data files.

Favorites/hearts deferred — no real ask yet. Building it before Sandra and Nève use the app is solving an imaginary problem.

Photos deferred — no source content yet. The schema supports a slot; the UI doesn't render anything until photos exist.

Map-follows-day behavior — the day-by-day reading is a guided tour, not a passive reference. Tap a day, see that day's geography. Tap a place, zoom to that place. This is the move that turns the app from a static map into a narrative tool.

Place attribution is first-class — every place can carry a record of who recommended it, when, in what context, with what note. Recommendations are not metadata; they're the substance of how the library accumulates value over time.

Capture/process workflow on new places — Marcos texts rough notes; Claude does the structuring. Friction is on capture, not processing.

## Voice references

Sebald's *Rings of Saturn* for the prose register — geography as memory, the walking essay, the willingness to dwell. ECAL Lausanne for the typography — Swiss-design discipline carried into a contemporary moment. Aby Warburg's *Mnemosyne Atlas* for the place-as-node thinking — places accumulate meaning across associations, not just chronology. Apple Maps's drawer pattern for the mobile interaction (but not its tone). The Pléiade editions of French literature for the editorial standard — austere covers, considered apparatus, the assumption that the reader is paying attention.

## Capture-and-process workflow for new places

When the owner texts a quick note like "Sandra recommended Le Petit Nice in Marseille, bouillabaisse, lunch on the corniche" — that's the capture. The processing happens later, in chat with Claude:

1. Owner pastes the rough note into chat.
2. Claude looks up the place — confirms the name (Le Petit Nice = Restaurant Passédat, three Michelin stars), gets the address, phone, website, hours, category.
3. Claude writes the vibe paragraph in the project's voice — short, specific, avoiding superlatives.
4. Claude formats the recommendation entry with proper attribution: source slug (`sandra` or `pierre`), date, context, the note.
5. Claude tags consistently with the rest of the library.
6. Claude produces either a complete markdown file ready to drop in the place-files directory, or a JSON entry ready to paste into `places.json`.
7. Claude tells Marcos which trip days the place might fit into.
8. Marcos reviews and commits via Claude Code.

Source slugs stay consistent across places because Claude tracks them across conversations. If Sandra has recommended three places over time, all three say `source: sandra`. If a different Pierre needs to be disambiguated from the existing one, the slug becomes `pierre-marseille` vs `pierre-aix`. The consistency is enforced by Claude, not by a vocabulary file.

Friends become first-class citizens of the library through their attributions. Over time, the project should be able to answer "what has Sandra recommended that hasn't been used yet" — that query is implicit in the data structure even if no UI surfaces it yet.
