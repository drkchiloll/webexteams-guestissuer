import * as jwt from 'jsonwebtoken';
import { Promise } from 'bluebird';
import * as uniqid from 'uniqid';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as moment from 'moment';

export type ReqParams = {
  url: string;
  method: string;
  data?: any;
  token: string;
}

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
  req({url, method, token, data}) {
    return this.request({
      url,
      method,
      headers: { Authorization: `Bearer ${token}`},
      data
    });
  }
}

const TeamsGuestIssuer = (guestAppId: string, guestAppSecret: string) => {
  const service: any = {
    teamsApi: new TeamsApi(),
    generateId() {
      return uniqid();
    },

    generateJwt({userid, user}) {
      return new Promise((resolve, reject) => {
        const payload = {
          sub: userid || this.generateId(),
          name: user,
          iss: guestAppId,
          exp: Math.round(Date.now() / 1000) + (90*60)
        };
        const decoded = Buffer.from(guestAppSecret, 'base64');
        jwt.sign(payload, decoded, {
          algorithm: 'HS256',
          noTimestamp: true
        }, (e: jwt.JsonWebTokenError, token) => {
          if(e) return reject(e);
          else {
            return resolve({success: true, token });
          }
        });
      });
    },

    tokenExpDate(expires) {
      return moment().add(expires, 'seconds').format();
    },

    retrieveAuthToken(token) {
      return this.teamsApi
        .getAuthToken(token)
        .then(authData => {
          authData['expiration'] =
            this.tokenExpDate(authData.expiresIn);
          return authData;
        })
        .catch(e => e);
    },

    verifyToken(token) {
      return jwt.decode(token, { complete: true });
    },

    getGuestDetails(token) {
      return this.teamsApi.getMe(token)
        .then((resp: any) => resp.data);
    },

    genericRequest(params: ReqParams) {
      return this.teamsApi.req(params)
        .then((resp: any) => resp.data)
        .catch(err => err);
    }
  };
  return service;
};
export { TeamsGuestIssuer };