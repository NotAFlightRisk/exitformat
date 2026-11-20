<h1 align="center">Exit Format</h1>
<p align="center">
<i>How to get your data out of online services, what formats you get, what's missing, and where you can take it</i>
<br />
<b>🌐 <a href="https://exitformat.peng.ly/">exitformat.peng.ly</a></b><br />
</p>

<details>
  <summary>Contents</summary>

- [About](#about)
- [Using the site](#using-the-site)
- [The data](#the-data)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [Development](#development)
- [Credits](#credits)

</details>

## About

Exit Format is an open directory of how to get your data out of apps and online services. For each one, it lists every way to export, the files you'll get, what's in them and what gets left behind, with short steps and a link to the official docs.

It then matches exports up against other apps' imports, so you can see where your data can actually go and how much of it makes it across. Plus how to delete your account once you're out.

Every entry is written from the service's own docs or source code, and says when it was last checked.

---

## Using the site

Search for an app on [exitformat.peng.ly](https://exitformat.peng.ly), or browse the [categories](https://exitformat.peng.ly/categories). Each service has a page, like [/notes/obsidian](https://exitformat.peng.ly/notes/obsidian), with its exports and imports, where it can move to, and how to close your account if it has one. A move between two apps gets its own page whenever there's a way across, like [/migrate/notion/obsidian](https://exitformat.peng.ly/migrate/notion/obsidian), and so does every [file format](https://exitformat.peng.ly/formats).

---

## The data

It's all built from YAML in [`data/`](../data), one file per entry. Services live in `data/services/<category>/`, and a file's path is its page, so `data/services/notes/obsidian.yml` is [/notes/obsidian](https://exitformat.peng.ly/notes/obsidian). File formats are in `data/formats/`, and categories, with the list of things their services can export, are in `data/categories/`.

The same data's served as JSON too, if you want it for your own project:

| URL                                                                      | What's in it                                                                                                                                                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`/api/directory.json`](https://exitformat.peng.ly/api/directory.json)   | Every category, format and service in one file, with the migrations worked out                                                                                                                |
| [`/schema/service.json`](https://exitformat.peng.ly/schema/service.json) | The JSON Schema for a service file, with [`category.json`](https://exitformat.peng.ly/schema/category.json) and [`format.json`](https://exitformat.peng.ly/schema/format.json) for the others |

It's under the same [MIT licence](../LICENSE) as the code.

---

## Contributing

Most changes are a few lines of YAML. Every service page links to its file on GitHub, so a fix can start right there, and the checks on your pull request point out anything wrong, down to the line. The [contributing guide](./CONTRIBUTING.md) explains every field.

Not keen on YAML? Just [suggest a service](https://github.com/NotAFlightRisk/exitformat/issues/new?template=add-service.yml) or [report a mistake](https://github.com/NotAFlightRisk/exitformat/issues/new?template=fix-entry.yml) instead.

---

## Deployment

It's a fully static site, so it'll run anywhere that serves files.

### Option 1: Cloudflare

The live site is a Cloudflare Worker serving the built files, deployed by [`deploy.yml`](./workflows/deploy.yml) on every push to `main`. In a fork, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets, then change the owner check and the domain in that file.

### Option 2: Vercel, or any static host

Fork the repo and import it into Vercel, which needs no config at all, or just use the button below 👇<br>
Anywhere else, set the build command to `npm run build` and the output folder to `build`.

[![1-Click Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-ffffff?style=for-the-badge&logo=vercel&labelColor=1b2744&link=https%3A%2F%2Fexitformat.peng.ly)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNotAFlightRisk%2Fexitformat&demo-title=Exit%20Format&demo-url=https%3A%2F%2Fexitformat.peng.ly)

### Option 3: Docker

There's a multi-arch image on DockerHub ([`notaflightrisk/exitformat`](https://hub.docker.com/r/notaflightrisk/exitformat)) and GHCR ([`ghcr.io/notaflightrisk/exitformat`](https://github.com/NotAFlightRisk/exitformat/pkgs/container/exitformat)). With Docker installed, just run:

```shell
docker run -p 8080:8080 notaflightrisk/exitformat
```

It's then up on [localhost:8080](http://localhost:8080).

### Option 4: From a release

Each [release](https://github.com/NotAFlightRisk/exitformat/releases) has the built site attached as `site.zip`, which any static file server will serve:

```shell
unzip site.zip -d site && npx serve site
```

### Option 5: Build from source

Follow the [Development](#development) steps, then run `npm run build`. The site lands in `build/`.

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
