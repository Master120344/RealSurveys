# MyRealSurveys

A static, responsive survey-site redesign with a working guest preview. The homepage, catalog, account screens, survey runner, feedback step, balance preview, privacy, support, and giveaways pages share one design system.

## Preview

Use **guest** / **password** at `login.html`. Seven independent sample surveys cover Starbucks, Apple, Nike, Netflix, Target, McDonald’s, and Amazon. Each path contains exactly ten questions followed by an optional final message. Answers shape later questions; changing an earlier answer clears dependent answers. People without recent experience receive expectation questions instead of being screened out.

Final feedback starts anonymous. Optional identifying information requires a separate choice; “Never mind” clears it. The demo does not transmit survey answers or identifying details. Only guest state, completed survey IDs, and completion timestamps are saved in tab-local session storage. Demo credits have no cash value. They are never written to Firebase balances.

## Existing accounts

The existing Firebase email sign-in, registration, password reset, and balance integration is retained and loaded only when needed for account actions. Its live configuration, authorized domains, provider settings, and Firestore rules still need owner verification. There is no new Google OAuth or Turnstile integration. Client-side guest state is not an authentication or payment security boundary.

## Publishing

The main branch is the source of the existing GitHub Pages site at https://master120344.github.io/RealSurveys/. This repository is not bound to ChatGPT Sites. The requested myrealsurveys.com custom domain did not resolve in DNS when checked on October 5, 2026; domain DNS and GitHub Pages domain settings need to be restored separately. No CNAME redirect is added while the domain is unavailable.

## Build

Run `node scripts/build-static.mjs`. This stages the public application into `dist/` for static hosting. The staging allowlist excludes environment files and the unused legacy scripts. The original desktop/mobile source pages remain in the repository; supported top-level aliases redirect to the responsive pages.

`node scripts/check.mjs` checks local references and the question data. The redesign also underwent DOM interaction verification for guest login, all seven completion flows, non-user branches, answer invalidation, anonymous defaults, optional-detail deletion, duplicate credits, and catalog filters. Full visual browser QA and real Firebase account operations have not been performed in this environment.

## Before a paid launch

The current catalog contains samples, not sponsored or funded campaigns. Production needs server-verified authentication, eligibility and one-response enforcement, a durable response store with explicit recipient consent, approved brand campaigns, a payment ledger, and actual payout fulfillment. No token, exchange, liquidity mechanism, wallet connection, or guaranteed reward has been implemented. The future coin idea is described as a concept only.

## Assets

Original company art remains in `surveycards/`. The bright design uses six local Simple Icons SVG marks (version 16.34.0, license in `assets/Simple-Icons-LICENSE.md`) and the supplied Amazon artwork. Featured logos identify sample-survey subjects and imply no affiliation. The hero illustration was created for this redesign. Two additional illustrated people use locally hosted two-pose sprite animations with aligned baselines; they do not bob or float. Contextual hints can be dismissed and reopened; animation can be paused and respects reduced-motion preferences. DM Sans is self-hosted; its license is in `assets/DM-Sans-LICENSE.txt`. The refreshed guest experience loads no third-party fonts, analytics, advertising, or tracking scripts.
