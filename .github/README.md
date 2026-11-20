<h1 align="center">Project Name</h1>
<p align="center">
<i>Short description</i>
<br />
<b>🌐 <a href="https://project.peng.ly/">project.peng.ly</a></b><br />
</p>

<details>
  <summary>Contents</summary>

</details>

## About

---

## Usage


---

## Deployment

### Option 1: Vercel

Fork the repo, login to Vercel, and import it. Or just use the 1-click deploy button below 👇

[![1-Click Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-ffffff?style=for-the-badge&logo=vercel&labelColor=1b2744&link=https%3A%2F%2Fproject.peng.ly)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNotAFlightRisk%2Frepo&demo-title=Project%20Name%20Demo&demo-url=https%3A%2F%2Fproject.peng.ly)

### Option 2: Docker

There's a light-weight multi-arch image on DockerHub ([`notaflightrisk/repo`](https://hub.docker.com/r/notaflightrisk/repo)) and GHCR ([`ghcr.io/notaflightrisk/repo`](https://github.com/NotAFlightRisk/repo/pkgs/container/repo)). Providing you've got Docker installed, just run:

```shell
docker run -p 3000:3000 notaflightrisk/repo
```

### Option 3: Build from source

Follow the [Development](#development) steps, then run `npm run build`.<br>
That'll put a Node server in `build/`, which you can start with `node build`.

---

## Configuration

---

## Development

You'll need [Node](https://nodejs.org/) 20 or newer, plus [Git](https://git-scm.com/). It's a [SvelteKit](https://svelte.dev/docs/kit) app, so there's nothing else to install.

```bash
git clone git@github.com:NotAFlightRisk/repo.git
cd repo
npm install
npm run dev
```

The dev server is then on [localhost:5173](http://localhost:5173).<br>
The other scripts you'll want are `npm run check` (types), `npm test` (tests) and `npm run preview` (serve a production build locally).

Alternativley, build the container with `docker build -t repo .`

[![Open in VS Code](https://img.shields.io/badge/CodeSpaces-Try_Live-007ACC?style=for-the-badge&logo=vscodium&labelColor=1b2744&link=https%3A%2F%2Fgithub.com%2FNotAFlightRisk%2Frepo)](https://codespaces.new/NotAFlightRisk/repo)

---

## Credits

##### Contributors

<!-- Public repos only - the badge service asks the GitHub API anonymously, so a private one gets an error box -->
[![contributors badge](https://readme-contribs.as93.net/contributors/NotAFlightRisk/repo?shape=squircle)](https://github.com/NotAFlightRisk/repo/graphs/contributors)

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
