#!/bin/sh
# Vercel's "Ignored Build Step" (vercel.json ignoreCommand): exit 0 skips the build, exit 1 builds.
# Skips Dependabot previews and changes that touch only docs, to stay under the 100-deploys-a-day limit.

if [ "$VERCEL_ENV" != "production" ] && [ "$VERCEL_GIT_COMMIT_AUTHOR_LOGIN" = "dependabot[bot]" ]; then
  echo "Skipping: Dependabot preview"
  exit 0
fi

# Compare with the last successful deployment of this branch, so every commit since then counts,
# and fall back to the previous commit when that one is missing from Vercel's shallow clone.
base="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"
git cat-file -e "$base^{commit}" 2>/dev/null || base="HEAD^"
if ! git cat-file -e "$base^{commit}" 2>/dev/null; then
  echo "Building: no earlier commit to compare with"
  exit 1
fi

if git diff --quiet "$base" HEAD -- . ':(exclude)docs' ':(exclude)*.md' ':(exclude)LICENSE'; then
  echo "Skipping: only docs changed since $base"
  exit 0
fi

echo "Building: code changed since $base"
exit 1
