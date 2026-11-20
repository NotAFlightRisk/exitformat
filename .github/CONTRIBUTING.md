# Contributing

Thanks for helping people get their data out 🎉<br />
Most of Exit Format is data, so most contributions are one YAML file. By joining in, you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md).

- [Add or fix a service](#add-or-fix-a-service)
- [Formats and categories](#formats-and-categories)
- [Checking your change](#checking-your-change)
- [Working on the site](#working-on-the-site)
- [Pull requests](#pull-requests)

---

## Add or fix a service

Each service is one file, and its path is its address, so `data/services/notes/obsidian.yml` is [exitformat.peng.ly/notes/obsidian](https://exitformat.peng.ly/notes/obsidian). Every service page links to its file on GitHub, which is the quickest way to fix one. To add one, copy a service from the same category and work through it - `notion.yml` and `aegis.yml` are the fullest.

The file name is the id, lowercase with dashes, so don't rename one that's live. It has to be unique across every category too, since migrate pages only carry ids (`/migrate/notion/obsidian`).

Not keen on YAML? Open an [add a service](https://github.com/NotAFlightRisk/exitformat/issues/new?template=add-service.yml) or [fix an entry](https://github.com/NotAFlightRisk/exitformat/issues/new?template=fix-entry.yml) issue instead.

---

### What goes in it

```yaml
name: Obsidian
website: https://obsidian.md/
description: A notes app that keeps everything as Markdown files on your own device. # 160 characters at most
deployment: local # local, cloud, hybrid or self-hosted
platforms: [windows, macos, linux, android, ios]

export:
  - id: vault
    name: Copy your vault folder
    method: folder
    formats: [markdown, markdown-frontmatter]
    steps:
      - Right-click a note and choose Show in system explorer.
      - Go up to the top folder of your vault and copy the whole thing somewhere safe.
    data:
      included: [text, attachments, links, tags]
      excluded: [history]
      unknown: [dates]
    limitations:
      - Wikilinks are Obsidian's own syntax, so other apps may show them as plain text.
    docs: https://help.obsidian.md/data-storage

import: [] # same shape as export

verification:
  status: documented
  checked_at: 2026-11-20
```

`export` and `import` are lists of options, one for each way out or in. Each option has an `id` that's unique in its list and a `name` in sentence case, plus:

- `method` - `file` (save a file or zip), `folder` (the data's already plain files, so copy the folder), `account` (ask for a copy and wait for it), `api`, `qr` or `copy` (by hand, one at a time). Imports can also be `connect`, which signs in to the other service and pulls it all across.
- `formats` - ids from `data/formats/`.
- `steps` - 2 to 4 short instructions, 140 characters at most, with labels exactly as the app shows them and menus like `Settings --> Backup --> Export`.
- `data` - what comes out, using the ids in the category's `data` list (plus `settings`, which every category has). `included` is what you've seen it write, `excluded` is what the app has but the export drops, and `unknown` is anything you couldn't confirm. Only list things the app actually has, or every move out of it claims to lose them, and never guess - `unknown` is an honest answer.
- `limitations` - short sentences about what bites, like no encryption, a paid plan or data that doesn't come across. `requirements` are short phrases, like `Paid plan` or `iOS only`.
- `docs` - the service's own how-to. When there isn't one, put the best evidence you've got in `sources` instead: source code pinned to a release tag, release notes or a staff reply. Never a "how to export" blog.

An import's `data` is what that importer keeps and drops, and it's fine to leave out if nobody's said. `from` names the service an importer was built for, when the format doesn't already say so. It has to be one we've got, so for anything else just name it in the option, like `Import from Authy`.

`delete` is optional, with the steps to delete your data and account afterwards, for anything kept on someone else's servers. `verification.status` is `documented` when you wrote it from docs or source code, or `tested` if you ran the export and the import yourself. Set `checked_at` to the day you went through the whole file, not just one field, since anything over a year old gets flagged as due a re-check.

You never write migrations by hand. They're worked out from the exports and imports, so getting `formats` and `data` right is what gets them right.

The [schema](https://exitformat.peng.ly/schema/service.json) has every field and value. Point an editor that speaks JSON Schema at it, like VS Code with the YAML extension, and it'll autocomplete the fields as you type.

---

## Formats and categories

Formats are in `data/formats/`, one per file:

```yaml
name: 2FAS backup
extensions: [.2fas]
standard: false # true for an open format any app can read, false for one app's own
owner: 2fas # optional, the service whose own format it is, once we list that service
based_on: json # optional, the format underneath
description: The backup file 2FAS Auth writes. It's JSON underneath, and a password encrypts the tokens.
```

Use a shared format (`markdown`, `csv`, `json`, `html`, `pdf`, `otpauth-uri`...) when that's really what the file is, and give an app's own format an id like `notion-html` or `joplin-jex`. Set `owner` on an app's own format when that app's in `data/services`, since it decides which moves get a step-by-step guide - an importer that reads 2FAS's backup was made for 2FAS. Leave it off when the owner's not listed yet, or when it's an app format other apps write too (Aegis exports Google Authenticator's QR codes, but the importers for them weren't made for Aegis). Moves through those, and through open formats, get listed by format on each app's page instead. Adding a service? Set `owner` on its own formats and `from` on any importer named after it. Formats can have a `spec` link and `conversions` too, which are a tool and 2-4 steps that turn the file into another format. That's how two apps with no format in common still show up as a way to move, so only add one for a real gap.

Categories are in `data/categories/`, and each one's `data` list is the vocabulary every service in it uses, so changing it touches all of them. [Open an issue](https://github.com/NotAFlightRisk/exitformat/issues/new?template=feature_request.yml) before adding a category or reworking its list.

---

## Checking your change

```bash
npm install
npm run validate
```

That checks every file against the schema and every id against the others, and says which line is wrong:

```
data/services/notes/jotter.yml
  ✗ line 11: export[0].formats[1] "scroll" isn't a format we know - add data/formats/scroll.yml or use one we have
  ⚠ line 24: export[1] has no official docs, link them if they ever turn up
```

Errors (✗) need fixing, warnings (⚠) are just a nudge. `npm run validate -- --file <path>` checks one file, and a pull request shows the same messages on the right lines in its "Files changed" tab.

Two things it can't catch. It doesn't open links, so click yours, since a dead help page often redirects to the home page and looks fine. And quote any text with ` #` in it, because YAML quietly cuts the line off there.

---

## Working on the site

It's [SvelteKit](https://svelte.dev/docs/kit), prerendered to plain HTML, and you'll need [Node](https://nodejs.org/) 22.18 or newer.

```bash
git clone git@github.com:NotAFlightRisk/exitformat.git
cd exitformat
npm install
npm run dev
```

`npm test` runs the tests, `npm run check` the types and `npm run format` tidies everything up. Loading, checking and matching up the data all lives in `src/lib/data/`, which the validator in `scripts/` uses too.

---

## Pull requests

1. Fork it and branch off `main`
2. Keep it to one thing - one service, or one fix
3. Fill in the template's Category. It picks the label, which decides where the change shows up in the release notes
4. Title it as a [Conventional Commit](https://www.conventionalcommits.org/), since the title becomes the commit: `feat(data): add Logseq` for a new service, `fix(data): refresh Notion` for a re-check, or `feat: filter services by platform`

Types are `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`, `ci` and `chore`. Breaking changes get a `!`, like `feat!:`.

Don't worry about getting it perfect first time, we're happy to help get it over the line.

---

## Licensing

By contributing, you agree that your work is licensed under the [MIT License](../LICENSE) that covers this project.
