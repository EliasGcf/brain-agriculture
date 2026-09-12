# Issue tracker: GitHub

Issues and specs live in GitHub Issues for EliasGcf/brain-agriculture.
Use the gh CLI from this repository.

## Conventions

- Create: gh issue create --title "..." --body-file <file>
- Read: gh issue view <number> --comments
- List: gh issue list --state open --json number,title,body,labels
- Comment: gh issue comment <number> --body-file <file>
- Apply labels: gh issue edit <number> --add-label "..."
- Remove labels: gh issue edit <number> --remove-label "..."
- Close: gh issue close <number> --comment "..."

Use a temporary Markdown file for multiline bodies.
Infer the repository from git remote -v.

When a skill says "publish to the issue tracker", create a GitHub issue.
When it says "fetch the relevant ticket", read the issue and its comments.

## Pull requests as a triage surface

PRs as a request surface: no.

## Wayfinding operations

For /wayfinder, use a parent issue labelled wayfinder:map.
Link child tickets using GitHub sub-issues, or a task list in the parent
and a "Part of #<map>" reference in each child.

Use wayfinder:<type> labels: research, prototype, grilling, or task.
Represent blockers with native GitHub issue dependencies; if unavailable,
use a "Blocked by: #<number>" line in the child.

Select the first open, unassigned child in map order with no open blockers.
Claim it by assigning the current developer.
On resolution, comment with the result, close the ticket, and append a
summary and link to the map's Decisions-so-far.
