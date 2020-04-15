<h1 align="center">
  <br>
  <a href="https://editor.wickeditor.com/"><img src=".github/images/logo.svg" alt="Wick Editor" width="25%"></a>
  <br>
</h1>

<p align="center">
  <a href="https://github.com/Wicklets/wick-editor/issues">
      <img src="https://img.shields.io/badge/contributions-welcome-orange.svg"/>
  </a>
  <a href="https://www.patreon.com/WickEditor">
      <img src="https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&amp;style=flat"/>
  </a>
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg"/>
  </a>
  <a href="https://twitter.com/wickeditor?ref_src=twsrc%5Etfw">
    <img src="https://img.shields.io/twitter/follow/wickeditor?style=social&logo=twitter" alt="follow on Twitter"></a>
</p>

<h1>Wick Editor</h1>

The Wick Editor is a free and open-source tool for creating games, animations, and everything in-between. It's designed to be the most accessible tool for creating multimedia projects on the web.

<p align="center"><img width="100%" src=".github/images/editor.svg"></p>

## Getting started

These instructions are for MacOS and Linux, we currently don't have instructions for Windows, but if you need help please feel free to email zach@wickeditor.com.

### Requirements

You'll need to download the following:

- [npm](https://www.npmjs.com/get-npm)

### Installation

1) Clone this repository:

    ```bash
    git clone https://github.com/Wicklets/wick-editor/
    ```

2) Using the command line, change directories into the newly created `wick-editor` folder:

    ```bash
    cd wick-editor
    ```

3) Install all dependencies using this command:

    ```bash
    npm install
    ```

### Running the Editor

1) Run the editor with this command:

    ```bash
    npm start
    ```

2) Open a web browser and go to this URL:

    ```bash
    localhost:3000
    ```

Have fun hacking on Wick! 🎉

### Deploying to Production

To deploy, you'll need to have push access to this repo.

1) Test the production build by using `npm predeploy`

2) Run `npm run deploy`

### Deploying to Prerelease

1) Run `npm run prerelease-deploy`

## Support

<a href="https://www.patreon.com/WickEditor">
	<img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

## License

Wick Editor is under the GNU v3 Public License. See the [LICENSE](LICENSE.md) for more information.

## Links

* [Wick Editor Site](https://www.wickeditor.com)
* [Wick Editor Community Forum](https://forum.wickeditor.com/)
* [Follow on Twitter](https://twitter.com/wickeditor)
* [Follow on Facebook](https://www.facebook.com/wickeditor/)



## Bundling the Desktop App 

### Building for Mac, Windows and Linux

This build process uses [electron-builder](https://www.electron.build/) and uses code from a series of tutorials. We are not build experts, so here are the steps that we follow to package our applications. This process is confusing as heck, so don't be afraid to reach out for help.

We perform manual releases of the Wick Editor Desktop Applications. 

Note: We have only run this build process on our Mac development machines, results will almost certainly be different on Windows and you will not be able to sign/notarize the mac builds described below on Windows.

Part 0. Requirements:

You'll need to have XCode developer tools installer and have the ability to run the `xcrun` command in your terminal.

Part 1. Certificates: 

a) Apple Ceritifcates:

Before starting the build process, the developer that is building the desktop applications needs to obtain the appropriate certificates for signing the apps. Contact [Luca (Luxapodular)](mailto:luca@wickeditor.com) if you are on the Wicklets or Wick Editor team, you'll need to be added as a member of our organization on the [Apple Developer Program](https://developer.apple.com).

You'll need: 

1) An API Key ID
2) An API Key Issuer ID
3) A Windows Code Signing certificate (.p12 file) saved to your ~/private_keys directory and password.
4) A Developer ID Application Certificate (Saved to your keychain).
5) A Developer ID Installer Certificate (Saved to your keychain).

b) Windows Code Signing Certificates

We obtained code signing certificates from [SSL.com](https://www.ssl.com). Reach out to Luca to receive a certificate file if you are authorized to receive one.

Step 1. Building:

1.1) Run `API_KEY_ID="..." API_KEY_ISSUER_ID="..." WIN_CSC_LINK="~/PATH/TO/CERTIFICATE.p12" WIN_CSC_KEY_PASSWORD="PASSWORD" npm run build-packages`

 Ensure you provide the correct API key information as variables, or the Mac applications will not properly sign and notarize. If the certificates are installed correctly, they should automatically be used.

1.2) You should have several built installers and packages in the wick-editor/dist directory.

Step 2. Testing Installers and Apps:

2.1) The EXE and .dmg should be done! With a properly installed Code Signing Certifactes, you should have to do nothing else. 

2.2) The .pkg installer on the other hand will not be signed and notarized (Yes, the app inside the pkg is signed and notarized. If anyone know how to automate this process, please drop us a line!) Test this by uploading the .pkg to a service like Google Drive, then downloading and attempting to run the installer. You should receive a notice that says it is from an unidentified developer. 

2.3) Ensure that the apps at least run in the .dmg/.app before continuing.

Step 3. Signing and Notarizing Installers for MacOS:

3.1) Sign the PKG.

Run `productsign --sign 'Developer ID Installer: NAME (1234ABCDEFG)' ./dist/NAME_OF_.pkg ./dist/NAME_OF_SIGNED.pkg`

3.2) Notarize your PKG.

Run `xcrun altool --notarize-app --primary-bundle-id "com.wickeditor.wickeditorinstaller" --username "developerAccountEmail@email.com" --password "app-pass-word-abcd" --file "~/FULL/PATH/TO/SIGNED/PKG/Installer.pkg"`

This command will take time! When the file has been uploaded, you should receive an ID that looks like this.

`RequestUUID = 181638fb-a618-2298-bff0-47fa79f01326`

Keep track of that ID.

3.3) Check that the status of notarization.

This will take some time as you are sending the .pkg to apple to be notarized (often 3-10 minutes). You will not receive feedback unless you ping apple's servers.

Run `xcrun altool --notarization-info REQUEST_UUID "developerAccountEmail@email.com" --password "app-pass-word-abcd"`

And you will receive either an 'in-progress' or 'success' message.

If you see a success message, you're done! Ping again in a minute or two if you get an 'in-progress' message.

References for Mac Signing and Notarization (Genuinely, without these resources I wuld have been lost.)
1. [Samuel Meuli - "Notarizing your Electron App"](https://samuelmeuli.com/blog/2019-12-28-notarizing-your-electron-app/)
2. [Samuel Meuli - "Packaging and Publishing your Electron App"](https://samuelmeuli.com/blog/2019-04-07-packaging-and-publishing-an-electron-app/)
3. [Davide Barranca - "Notarizing Installers for MacOS Catalina"](https://www.davidebarranca.com/2019/04/notarizing-installers-for-macos-catalina/)

## Testing Support From

<a href="https://www.browserstack.com/"><img src=".github/images/browserstack.svg" alt="Browser Stack" width="25%"></a>

