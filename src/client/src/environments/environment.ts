/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    clientId: '750256806057-52odg19a6lkgbjuu67f3a12o0vq5aipq.apps.googleusercontent.com',
    clientSecret: '-59HNErVLJfZkM_RAH4s4l8N',
    redirectUri: 'http://localhost:4200/auth/oauth2/callback',
    appUrl: 'http://localhost:4200',
    oauthGoogleUrl: 'http://localhost:4200/auth/oauth',
};
