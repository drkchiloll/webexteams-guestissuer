const { SparkGuest } =  require('../dist');
const { id, secret } = require('./config');

const guest = new SparkGuest({
  id, secret
});

const userid = guest.generateId();
const displayName = 'John Doe';

return guest.generateJwt({
  userid, displayName
}).then(jwt => {
  const verification = guest.verifyToken(jwt);
  return guest.retreiveAccess(jwt)
}).then(authData => {
  // { token, expiresIn }
  const formattedExpiration = guest.getAccessTokenExpiration(authData.expiresIn);
  console.log(formattedExpiration);
  // Use Token to Make API Call
  return guest.getGuest(authData.token);
}).then(userDetails => {});
