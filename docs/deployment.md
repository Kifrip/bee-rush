# GitHub Pages deployment (historical)

> Superseded on 2026-11-10: the game is now published on Cloudflare Workers at https://pg-bee-rush.register-c02.workers.dev/ (see README → Hosting). GitHub Pages is disabled.

The user explicitly authorized pushing to the kifrip account and deploying via GitHub Pages on 2026-11-09, superseding the original local-only instruction.

Target repository: https://github.com/kifrip/bee-rush
Expected Pages URL after successful deployment: https://kifrip.github.io/bee-rush/

Current status: prepared locally; not pushed or deployed. The connected GitHub profile matches Kifrip, but the connector offers neither repository creation nor Pages setup. The managed environment denies requests to api.github.com; `gh api user` returns Forbidden. The shared browser also reports DNS_PROBE_FINISHED_NO_INTERNET when visiting github.com/new. No GitHub repository was created or altered during the blocked attempt.

The existing production build and QA remain valid. The deployment workflow is manual-dispatch only. After GitHub API access/authentication is available, run `bash scripts/publish-github.sh` from the project. It checks the account, creates the public repository if needed, pushes main, enables GitHub Actions Pages, then starts the Pages workflow. A conflicting existing repository is not overwritten.

Environment setup needed: permit api.github.com, then provide GitHub CLI authentication through the supported environment/account settings. Do not put tokens in this repository or chat. Public site verification also requires access to kifrip.github.io.
