# Security policy

The maintainer supports the current release on `main`.

## Report a vulnerability

Send a private report to [kandulanikhilvarma@gmail.com](mailto:kandulanikhilvarma@gmail.com).
Use the subject `Ruruma security report`.
Include the affected URL, clear reproduction steps, and the possible impact.
Remove the personal data and secrets from screenshots or logs.
Do not publish an exploit or sensitive report in a public issue.
The maintainer will assess the report and coordinate any repair.

The maintainer does not promise a response deadline or paid bounty.

## Release scope

The first release is a static brand website.
The site has no account system, server database, payment flow, or remote enquiry endpoint.
The brief tool prepares text in the visitor's browser.
A download saves that text to a local file.
The email action opens the visitor's email application.
The website does not confirm email delivery.

The visitor can choose to save a draft on the current device.
Browser-local storage is not an encrypted vault.
Anyone with access to that browser profile can potentially read a saved draft.
Do not enter credentials, health records, financial records, or confidential customer data.
Use the draft clear action after use on a shared device.

## External services

The host can process request data under its own policies.
Outbound links lead to separate websites with separate policies.
The site has no analytics or advertising integration in this release.
Future remote intake needs validation, rate limits, retention rules, and private access controls before activation.

## Safe verification

Limit tests to the Ruruma site and systems you control.
Do not send bulk requests, scan unrelated systems, or use real customer data as fixtures.
