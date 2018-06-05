import * as jwt from 'jsonwebtoken';
import { Promise } from 'bluebird';
import * as uniqid from 'uniqid';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as moment from 'moment';

class TeamsApi {
  private request: AxiosInstance;
  constructor() {
    this.request = axios.create({
      baseURL: 'https://api.ciscospark.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }
  getAuthToken(jwt) {
    return this.request({
      url: '/jwt/login',
      method: 'post',
      headers: { Authorization: `Bearer ${jwt}` }
    }).then((resp: AxiosResponse) => {
      if(!resp.data || !resp.data.token) {
        return Promise.reject(
          'failed to generate an access token: bad response'
        );
      } else {
        return resp.data;
      }
    });
  }
  getMe(token) {
    return this.request({
      url: '/people/me',
      method: 'get',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

const TeamsGuestIssuer = (guestIssuerId: string, guestSecret: string) => {
  const service: any = {
    jwtToken: null,
    authData: null,
    teamsApi: new TeamsApi(),
    generateSubject() {
      return uniqid();
    },

    generateToken({userid, user}) {
      return new Promise((resolve, reject) => {
        const payload = {
          sub: userid || this.generateSubject(),
          name: user,
          iss: guestIssuerId,
          exp: Math.round(Date.now() / 1000) + (90*60)
        };
        const decoded = Buffer.from(guestSecret, 'base64');
        jwt.sign(payload, decoded, {
          algorithm: 'HS256',
          noTimestamp: true
        }, (e: jwt.JsonWebTokenError, token) => {
          if(e) return reject(e);
          else {
            this.jwtToken = token;
            return resolve('SUCCESS');
          }
        })
      });
    },

    tokenExpDate(expires) {
      return moment().add(expires, 'seconds').format();
    },

    retrieveAuthToken() {
      return this.teamsApi
        .getAuthToken(this.jwtToken)
        .then(authData => {
          this.authData = authData;
          this.authData['expiration'] =
            this.tokenExpDate(authData.expiresIn);
          return this.authData;
        })
        .catch(e => e);
    },

    verifyToken(token) {
      return jwt.decode(token, { complete: true });
    },

    teamsGetUser() {
      return this.teamsApi.getMe(this.authData.token)
        .then((resp: any) => resp.data);
    }
  };
  return service;
};
export { TeamsGuestIssuer };