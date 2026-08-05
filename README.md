# GATool

gatool is a tool to provide ***FIRST®*** Game Announcers with up to date information while announcing events during the ***FIRST*** Robotics Competition and ***FIRST*** Tech Challenge seasons. As a web-based tool, it uses up-to-date information about the event to provide a comprehensive set of useful data to Game Announcers. It is designed to work on desktops, laptops and tablet devices. In a pinch, it can be used on a mobile phone.

Anyone can use the tool. Simply browse to [gatool.org](https://gatool.org) and go. However, you will need a login to access the team data editing features of the tool. See the Emcee and Game Announcer resource page and view the training presentations for instructions.

[Watch an overview of gatool on YouTube to learn more!](https://youtu.be/-n96KgtgYF0)

## Contributions

We welcome any and all contributions! Please feel free to fork the repository and contribute back to our development. [Issues can be filed in the GitHub issue tracker](https://github.com/arthurlockman/gatool-ui/issues/new).

## Using GATool with Cheesy Arena

GATool can use Cheesy Arena for its data source. This option will become available when you are using GATool while on the same network as Cheesy Arena. Some caveats:
- Cheesy Arena does not run in secure HTTP mode, so you will need to enable mixed mode content in your browser.  
  - This only works in Chrome
  - Mobile Browsers do not support mixed content
  - Browse to [https://gatool.org](https://gatool.org)
  - Click the site settings icon in the address bar\
![site settings](/public/enablemixedcontent1.png)
  - Navigate to **Privacy and security**
  - Enable insecure content for the site\
  ![site settings](/public/enablemixedcontent2.png)
- When using Cheesy Arena, your Playoff screen may not behave as expected. Also, the Stats page will not render properly, as that uses the FIRST APIs to get event details.
- You can [see a short video of GATool and Cheesy Arena working together](https://youtu.be/DVf14KrW0Iw).

## Development

This section has information on how to build and deploy the project.
### Building

GATool is built using [create-react-app](https://create-react-app.dev). To get started, run:

```bash
git clone git@github.com:arthurlockman/gatool-ui.git
cd gatool-ui
npm i
npm run start
```

This will start the local development server on port 3000.

In order to test the PWA features of the app locally, run:

```
npm i -g serve
npm run build && serve -s build
```

Note that when running as a PWA, debugging will not be available.

#### Testing with a local `gatool-api`:

Copy `.env.example` to `.env` and adjust any variables needed to point the UI at your local API.

Configure `gatool-api` according to the local development instructions in that repository.

Start the app using the directions above

### Tests

```bash
npm test            # vitest watch mode
npm run test:ci     # one-shot run with coverage
```

Most tests live next to the source they exercise (`src/utils/*.test.js`, `src/hooks/*.test.js`).

#### API fixtures

Hook tests use [MSW](https://mswjs.io/) to mock `api.gatool.org`. Mock responses come from JSON files committed under `src/test/fixtures/`, captured directly from prod with `scripts/capture-fixtures.sh`. The default capture targets are `2026 / MAWOR / team 190`; override with env vars:

```bash
./scripts/capture-fixtures.sh                         # 2026 / MAWOR / team 190
YEAR=2025 EVENT=NYTR TEAM=254 ./scripts/capture-fixtures.sh
```

Re-run the script when you suspect an upstream contract change or when adding a hook test that needs an endpoint not yet captured. After capture, review `git diff -- src/test/fixtures/` — unintended diffs in committed fixtures usually indicate the upstream API changed shape.

Read endpoints on `api.gatool.org` are open, so capture works without auth.

### Deploying

GATool has two main active deployments: [beta](https://beta.gatool.org) and [production](https://gatool.org). Both are hosted on Cloudflare Pages and deployed automatically from GitHub.

To deploy to beta, commit and push to the beta branch. To send things to production, [make a pull request from beta to the main branch](https://github.com/arthurlockman/gatool-ui/compare/main...beta?expand=1) and merge. Merging the changes will create a new production deployment.

### Sourcemaps

Production builds emit no sourcemaps, so nothing is exposed publicly. The
`.github/workflows/newrelic-sourcemaps.yml` workflow rebuilds each `main`/`beta` push with
`SOURCEMAP=hidden` — which emits `.map` files without altering a single emitted JS byte, so the
content hashes match what Cloudflare deployed — then verifies every filename against the live site
before uploading the maps to New Relic. This de-minifies stack traces in the Errors inbox.

To generate sourcemaps locally, run `SOURCEMAP=hidden npm run build`.
