#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repository='kifrip/bee-rush'
account="$(gh api user --jq .login)"
if [[ "${account,,}" != 'kifrip' ]]; then
  printf 'Expected GitHub account kifrip, got %s. Stopping.\n' "$account" >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  printf 'Commit local changes before publishing.\n' >&2
  exit 1
fi
if gh repo view "$repository" --json name >/dev/null 2>&1; then
  remote_head="$(git ls-remote "https://github.com/$repository.git" HEAD)"
  if [[ -n "$remote_head" ]]; then
    printf 'The remote repository already has commits. Inspect it before pushing.\n' >&2
    exit 1
  fi
else
  gh repo create "$repository" --public --description 'Bee Rush: a polished Phaser 3 pixel-art garden arcade game'
fi
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/$repository.git"
fi
if [[ "$(git remote get-url origin)" != "https://github.com/$repository.git" ]]; then
  printf 'Unexpected origin remote. Stopping.\n' >&2
  exit 1
fi
gh auth setup-git
git push -u origin main
pages_status="$(gh api "repos/$repository/pages" --jq .build_type 2>/dev/null || true)"
if [[ -z "$pages_status" ]]; then
  gh api --method POST "repos/$repository/pages" -f build_type=workflow
elif [[ "$pages_status" != 'workflow' ]]; then
  gh api --method PUT "repos/$repository/pages" -f build_type=workflow
fi
gh workflow run pages.yml --repo "$repository" --ref main
printf 'Workflow started. Track it with: gh run list --repo %s --workflow pages.yml\n' "$repository"
printf 'After success, verify: https://kifrip.github.io/bee-rush/\n'
