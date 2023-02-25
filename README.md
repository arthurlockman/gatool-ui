# GATool

gatool is a tool to provide FIRST® Game Announcers with up to date information while announcing events during the FIRST Robotics season. As a web-based tool, it uses up-to-date information about the event to provide a comprehensive set of useful data to Game Announcers. It is designed to work on desktops, laptops and tablet devices. In a pinch, it can be used on a mobile phone.

You will need a login to access the tool. All registered GAs and MCs will receive an invitation with a login and password.

[Watch an overview of gatool on YouTube to learn more!](https://youtu.be/-n96KgtgYF0)

## Contributions

We welcome any and all contributions! Please feel free to fork the repository and contribute back to our development. [Issues can be filed in the GitHub issue tracker](https://github.com/arthurlockman/gatool-ui/issues/new).

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

### Deploying

GATool has two main active deployments: [beta](https://beta.gatool.org) and [production](https://gatool.org). Both are hosted on Azure web services and deployed automatically from GitHub.

To deploy to beta, commit and push to the beta branch. To send things to production, [make a pull request from beta to the main branch](https://github.com/arthurlockman/gatool-ui/compare/main...beta?expand=1) and merge. Merging the changes will create a new production deployment.
