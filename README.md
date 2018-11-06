# Webex Teams Guest Issuer Programmatic AuthToken Generator

This is a module that issues Webex Teams Authorization Tokens for Guest Issuer App Users that allow Guests to persistently use Webex Teams throught the Teams SDKs and Widgets within your application logic. If you want to generate tokens from the CLI refer to Steve Sfartz repository [here](https://github.com/ObjectIsAdvantag/guestissuer). To use the Guest Issuer Service you must first __have a Webex Teams Paid account__ and create a Guest Issuer Application from the [Webex for Developers portal](https://developer.webex.com/add-guest.html).

## Installation
```
npm install -s webexteams-guestissuer
```

## Usage
```javascript
const { SparkGuest } = require('webexteams-guestissuer');
const guest = new SparkGuest({
  id: 'GuestAppId generated from the DEV Portal',
  secret: 'GuestSecret generated from the DEV Portal'
});
// Generates a Unique ID for the User
const guestId = guest.generateId();
guestIssuer.generateJwt({
  userid: guestId,
  displayName: 'MyGuestUser'
}).then(jwt => {
  // guestIssuer.jwtToken = the Generated JWT for use to obtain AuthToken
  guest.retreiveAccessToken(jwt)
    .then(authData => {
      /**
       * AuthData <Object>
       * AuthData.token <String>
       * AuthData.expiresIn <Number>
       * AuthData.formattedExpiration <UTC Formatted DataTime>
       */
      // Uses the people/me Webex Teams Endpoint
      guestIssuer.getGuest(authData.token).then(loggedInUser => {
        //{ id, emails, displayName, orgId, type: "appuser", created, avatar }
      })
    })
}).catch(error => 'Something Went Wrong');
```

## Contributing and/or Fork

This module is written using Typescript. Clone this Module to submit PRs or continue development as your own repository.

```
npm install
# To Build for PROD
npm run build
# Development (watches all ts files in the src directory and builds on change
npm run dev
```

## License
MIT
