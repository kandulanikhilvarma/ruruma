# Release verification

Date: 22 October 2026.

## Software checks

The local verification covered these checks:

| Check | Result |
| --- | --- |
| ESLint | Passed with no warnings. |
| TypeScript checkJs | Passed with no emitted files. |
| Static pages | Metadata, labels, anchors, local files, and JavaScript syntax passed. |
| Mermaid | Both README diagrams parsed. |
| Brief unit tests | All 12 passed. |
| Source DOM integration tests | All 9 passed in isolated JSDOM documents. |
| Static build | Passed. |
| npm audit | Zero known vulnerabilities at the check time. |
| Design detector | Returned no findings. |
| STE prose check | No error-level findings after repair. Advisory warnings received a manual review. |

The JSDOM tests run the actual browser module against isolated test documents.
They cover errors, result generation, optional storage, draft recovery, draft removal, storage denial, expired records, clipboard recovery, and service selection.
Test records do not ship in the website.

The preview server also passed route, MIME, security-header, HEAD, and method checks.
The server rejected path traversal, dotfiles, and malformed paths.
The build rejected unsafe origins and private asset paths in isolated fixtures.

## Browser evidence

The local Chrome review covered a 1920-pixel desktop and a 390-pixel mobile viewport.
Both layouts had no horizontal overflow.
The supplied logo and local fonts rendered.
The mobile menu opened and its links worked.
Industry and outcome choices changed the proposed scope.
The selected industry and outcome transferred to the brief form.

An empty form showed field errors and moved focus to the error summary.
A valid draft survived a page reload after explicit consent.
The tool generated the complete brief and the encoded email link.
The browser downloaded a text brief to the local Downloads folder.
The file contents included the workflow, pilot, measures, and service limits.
No email was sent.

The browser download-event observer timed out even though the download completed.
The file system confirmed the downloaded file and its contents.
Further browser access then failed automatic approval review because of an account usage limit.
No alternate browser path bypassed that denial.

Draft removal and clipboard-denial recovery passed the source DOM tests.
Those two steps did not receive a final rendered-browser check.
The local test draft can remain in the preview browser profile.
It does not exist on the production origin.
Use Clear draft in that local preview to remove it.

## Design review

The independent reviewer requested two changes.
The source now puts project status labels below the project headings.
The persisted contract now describes the hero as an animated workflow diagram.

The documentation correction is resolved.
The label correction is present in source, but its final rendered spacing remains unverified.
The reviewer therefore retained **disposition: fix** for that visual confirmation alone.
The reviewer requested no further source changes.
See [the design review](DESIGN-REVIEW.md).

The available screenshots cover the hero and part of the mobile service explorer.
The lower sections received source review, not a full visual audit.
No formal accessibility certification or performance score is claimed.

## Provider acceptance and production

Local checks do not establish production activation.
The final delivery record must name the actual GitHub head, merge result, source backup, Sites version, and terminal deployment state.
The production build exposes its source SHA in `release.json`.

The owner approved free Sites hosting.
Vercel remains inactive because the current account reports Hobby and team access needs repair.
The intended domain is `ruruma.me`.
DNS and certificate status need separate provider verification.

No database, authentication provider, payment account, or email delivery provider is required for the defined release.
The visitor sends the message through the email application.

## Check boundaries

The supplied GitHub hygiene skill contains no helper scripts in this installation.
Repository structure, author identity, commit text, diagrams, and source changes received equivalent direct checks.
No absent helper run is claimed.

The STE checker does not include the approved ASD dictionary.
The prose follows its mechanical rules; formal STE compliance is not claimed.
