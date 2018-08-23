const { TeamsGuestIssuer } =  require('../dist');
const { creds: { id, secret }} = require('./config');
const guest = {
  userid: '1vfjjgg4bph9',
  username: 'CE_Emulator'
};

// AppId + AppSecret (Generated @ developer.webex.com when creating GuestIssuer App)
const teamsIssuer = TeamsGuestIssuer(id, secret);

const genToken = {
  userid: guest.userid,
  user: guest.username
};

teamsIssuer.generateJwt(genToken)
  .then(({token}) => {
    return teamsIssuer.retrieveAuthToken(token)
      .then(authData => {
        teamsIssuer.getGuestDetails(authData.token).then(console.log);
      })
      .catch(console.log);
  })
  .catch(console.log);