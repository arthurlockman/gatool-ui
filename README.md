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

#### Testing with a local `gatool-api` and custom Auth0:

Create a new Auth0 Application, selecting the "Single Page Web Application" option
On the settings tab set the "Allowed Callback URLs", "Allowed Logout URLs" and "Allowed Web Origins" to `http://localhost:3000` and save. Record the Client ID and domain. The Client Secret is not needed for GATool.

In Auth0, go to Actions -> Triggers. Select "Post Login". On the post-login page, add a custom trigger named "Add Roles". Replace the content with
```
exports.onExecutePostLogin = async (event, api) => {
  if (event.authorization) {
    api.idToken.setCustomClaim("https://gatool.org/roles", event.authorization.roles);
  }
};
```
After creating the action, go back to the trigger and drag the newly created "Add Roles" action into the flow, and apply.

In Auth0, go to User Management -> Roles, and create two roles, one with an name of "admin" and the other with the name of "user". After a user has first logged in with oauth, you can assign either/both roles to the user from the User Mangement -> Users page. Any updates to roles may require a log out and back in to the app.

Copy `.env.example` to `.env`
Fill in the following variables:
- `REACT_APP_AUTH0_DOMAIN` and `REACT_APP_AUTH0_LOGIN_DOMAIN`: the domain recorded above (they could be different if you were using a custom login domain)
- `REACT_APP_AUTH0_CLIENTID`: the client ID recorded above
- `REACT_APP_AUTH0_CONNECTION`: Can be left on `google-oauth2` or changed to a different connection if you have configured one

Configure `gatool-api` according to the local development instructions in that repository.

Start the app using the directions above

### Deploying

GATool has two main active deployments: [beta](https://beta.gatool.org) and [production](https://gatool.org). Both are hosted on Azure web services and deployed automatically from GitHub.

To deploy to beta, commit and push to the beta branch. To send things to production, [make a pull request from beta to the main branch](https://github.com/arthurlockman/gatool-ui/compare/main...beta?expand=1) and merge. Merging the changes will create a new production deployment.
