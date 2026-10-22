# Contribute to Ruruma

Keep each change focused on a clear visitor need.
Read `PRODUCT.md` and `DESIGN.md` before a change to the product or interface.
Use an issue or pull request to explain a proposed change.

## Local checks

Use a current Node.js LTS release.
Install the development dependencies from the lockfile:

```sh
npm ci
```

Run the checks before a pull request:

```sh
npm run check
npm test
npm run build
```

Start the local preview:

```sh
npm run dev
```

Open `http://127.0.0.1:4173`.
Check the page at desktop and mobile widths.
Test the keyboard path and reduced motion.
Test valid input, invalid input, draft recovery, and brief download.

## Content and privacy

Use verified sources for claims about the founder or projects.
Label examples and estimates.
Do not add customer claims, testimonials, or outcome figures without evidence and permission.
Do not commit credentials, visitor briefs, private records, or local drafts.
Keep browser storage optional.
Do not add analytics or remote form intake without a clear product decision.

## Pull requests

Explain the problem and the resulting behavior.
List the checks that passed.
Include screenshots for interface changes.
Use concise Conventional Commit titles such as `fix: preserve draft recovery`.
The maintainer uses the approved owner identity and a message file for commits.
Do not add automated co-author or attribution trailers.

The maintainer verifies checks on the exact head before merge.
The maintainer backs up the base before a squash merge.
Read back the merged state after the merge.

## License

Contributions use Apache-2.0, subject to the terms in `LICENSE`.
Keep the notices for bundled third-party assets.
The license does not grant rights to Ruruma trademarks.
