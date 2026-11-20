<h1 align="center">Exit Format</h1>
<p align="center">
<img src="https://raw.githubusercontent.com/NotAFlightRisk/exitformat/refs/heads/main/static/favicon.svg" width="32" />
<br />
<i>How to get your data out of online services, what formats you get, what's missing, and where you can take it</i>
<br />
<b>🌐 <a href="https://exitformat.peng.ly/">exitformat.peng.ly</a></b><br />
</p>

<details>
  <summary>Contents</summary>

- [About](#about)
- [Contributing](#contributing)
- [The data](#the-data)
- [The site](#the-site)
- [Deployment](#deployment)
- [Development](#development)
- [Credits](#credits)

</details>

## About

Exit Format is an open directory of how to get your data out of apps and online services. It lists every way to export, the files you'll get, what's in them and what gets left behind. As well as compatibility and import options, to make migrating to a different app/service easier. We also have how-to steps, links to the docs, test scripts and account deletion instructions.

---

## Contributing

Most changes are a few lines of YAML. Every service page links to its file on GitHub, so a fix can start right there. The CI checks on your pull request point out anything wrong, down to the line. The [contributing guide](./CONTRIBUTING.md) explains every field.

Not keen on YAML? Just [suggest a service](https://github.com/NotAFlightRisk/exitformat/issues/new?template=add-service.yml) or [report a mistake](https://github.com/NotAFlightRisk/exitformat/issues/new?template=fix-entry.yml) instead.

---

## The data

It's all built from YAML in [`data/`](../data), one file per entry. Services live in `data/services/<category>/`, and a file's path is its page, so `data/services/notes/obsidian.yml` is [/notes/obsidian](https://exitformat.peng.ly/notes/obsidian). File formats are in `data/formats/`, and categories, with the list of things their services can export, are in `data/categories/`.

The same data's served as JSON too, if you want it for your own project:

| URL                                                                      | What's in it                                                                                                                                                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`/api/directory.json`](https://exitformat.peng.ly/api/directory.json)   | Every category, format and service in one file, with the migrations worked out                                                                                                                |
| [`/schema/service.json`](https://exitformat.peng.ly/schema/service.json) | The JSON Schema for a service file, with [`category.json`](https://exitformat.peng.ly/schema/category.json) and [`format.json`](https://exitformat.peng.ly/schema/format.json) for the others |

---

## The site

Search for an app on [exitformat.peng.ly](https://exitformat.peng.ly), or browse the [categories](https://exitformat.peng.ly/categories). Each service has a page (like [/notes/obsidian](https://exitformat.peng.ly/notes/obsidian)), with its exports and imports, where it can move to, and how to close your account if it has one. We've also got guides for transfering between two apps, where possible (like [/migrate/notion/obsidian](https://exitformat.peng.ly/migrate/notion/obsidian)), and a page for each [file format](https://exitformat.peng.ly/formats).

---

## Deployment

It's a fully static site, so it'll run anywhere that serves files. For example:

- **Cloudflare**: Fork the repo, add your `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets, then trigger the [`deploy.yml`](./workflows/deploy.yml) workflow
- **Vercel (or any static host)**: Just fork the repo, and import it. Or use the 1-click button below
- **Docker**: Run `docker run -p 8080:8080 notaflightrisk/exitformat` (availible from [DockerHub](https://hub.docker.com/r/notaflightrisk/exitformat) and [GHCR](https://github.com/NotAFlightRisk/exitformat/pkgs/container/exitformat))
- **From release**: Each [release](https://github.com/NotAFlightRisk/exitformat/releases) has the pre-built `site.zip`, ready to be served up (like `unzip site.zip -d site && npx serve site`)
- **Build from source**: Follow the [Development](#development) steps, then run `npm run build`. The site lands in `build/`

[![1-Click Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNotAFlightRisk%2Fexitformat&demo-title=Exit%20Format&demo-url=https%3A%2F%2Fexitformat.peng.ly)

---

## Development

You'll need [Node](https://nodejs.org/) 22.18 or newer, plus [Git](https://git-scm.com/). It's a [SvelteKit](https://svelte.dev/docs/kit) site, prerendered from the YAML, so there's nothing else to install.

```bash
git clone git@github.com:NotAFlightRisk/exitformat.git
cd exitformat
npm install
npm run dev
```

The dev server is then on [localhost:5173](http://localhost:5173).<br>
`npm run validate` checks the data, `npm test` runs the tests, `npm run check` the types, and `npm run preview` serves a production build.

Or build the container with `docker build -t exitformat .`

---

## Credits

Most of this was written from the apps' own help pages and source code, so thanks to every project that documents its exports properly.

##### Contributors

[![contributors badge](https://readme-contribs.as93.net/contributors/NotAFlightRisk/exitformat?shape=squircle)](https://github.com/NotAFlightRisk/exitformat/graphs/contributors)

---

<!-- License + Copyright -->
<p  align="center">
  <a href="https://github.com/NotAFlightRisk"><img width="64" src="https://pixelflare.cc/iain/gif/penguin-dance.gif" /></a><br>
  <sup>
    <i>Licensed under <a href="../LICENSE">MIT</a>, © <a href="https://peng.ly">NotAFlightRisk</a> 2026</i>
  </sup>
</p>

<!--
oooh, hello there! hope you're having a nice day :)
   |\__      |\___
 (:> __)X  (:o ___(
   |/        |/
-->
