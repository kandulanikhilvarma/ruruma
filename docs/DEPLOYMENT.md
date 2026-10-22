# Deployment notes

Status date: 22 October 2026.

The owner approved free Sites hosting for this release.
Vercel remains a prepared deployment option.
This release does not activate Vercel production.
Use the final delivery record for the actual published URL and source commit.

## Build

Use a current Node.js LTS release.
The static site needs no environment variables or secret keys.
Install the validation dependencies:

```sh
npm ci
```

Check the source and build the output:

```sh
npm run check
npm test
npm run build
```

The build writes the deployable site to `dist`.
Do not include local drafts, credentials, or research archives in the output.

## Sites

The publishing workflow registers a Site and records its project identity.
The workflow synchronizes the checked source and creates a deployment archive.
The archive must match the recorded source commit.
The native deployment result supplies the public URL and deployment state.
Read back that result before a live-site claim.

For a future source change:

1. Open the existing Site by its recorded identity.
2. Get a source credential for that Site.
3. Apply the focused source change.
4. Run the project checks.
5. Build the static output.
6. Save the matching source archive.
7. Deploy the saved version with the existing public audience.
8. Check the returned state and affected visitor flows.

Keep source credentials out of files, commit history, and shell arguments.
Do not register a duplicate Site for a routine update.

## Vercel activation

Vercel's Hobby plan permits non-commercial personal use only.
Ruruma is a commercial services brand, so Hobby is not suitable for this deployment.
See the [official Hobby plan rules](https://vercel.com/docs/plans/hobby).

The connected team's API returned HTTP 403 during access checks.
The deployment therefore needs account access as well as a suitable plan.
Do not start a paid plan or accept new terms without owner approval.

After the owner approves a suitable commercial plan:

1. Restore access to the intended Vercel team in the connector.
2. Confirm the target team and its plan.
3. Import `kandulanikhilvarma/ruruma` from GitHub.
4. Select the repository root as the project directory.
5. Select the Other framework preset.
6. Set the build command to `npm run build`.
7. Set the output directory to `dist`.
8. Set the production branch to `main`.
9. Set `SITE_URL` to the final HTTPS origin before the build.
10. Deploy the verified merged source commit.
11. Confirm that the deployment reports Ready.
12. Check the public page and the complete brief workflow.

Vercel can deploy Git branches and the production branch through its Git integration.
See the [official Git deployment guide](https://vercel.com/docs/git).
The repository's `vercel.json` retains the static deployment configuration.
Check that file against the project settings before activation.

## Custom domain

The intended domain is `ruruma.me`.
The owner's intent to buy the domain does not establish registration or DNS control.
Do not buy a domain or change unrelated DNS records without authorization.

For the selected host:

1. Confirm that the owner controls `ruruma.me`.
2. Add the domain to the existing site or project.
3. Copy the exact DNS records from the host.
4. Add those records at the domain's DNS provider.
5. Complete any ownership verification challenge.
6. Wait for the host to confirm valid DNS and HTTPS.
7. Check the apex domain and the chosen `www` redirect.
8. Set `SITE_URL` to the verified domain before a new build.
9. Deploy the new build.
10. Confirm the canonical URL and social metadata.

Do not guess an IP address or reuse DNS values from another project.
Vercel's [domain guide](https://vercel.com/docs/domains/working-with-domains/add-a-domain) describes its own project workflow.

## Release evidence

Keep these facts in the delivery record:

- The repository URL and merged commit.
- The pull request and exact-head check results.
- The saved backup of the pre-merge base.
- The host's terminal deployment state.
- The actual public URL and domain state.
- The browser checks and any remaining activation steps.

A successful local build does not prove provider acceptance or production activation.
An email draft does not prove message delivery.
