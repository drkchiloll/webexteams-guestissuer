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

export class SparkGuest {
  public appId: string;
  public appSecret: string;
  private request: AxiosInstance;
  constructor({ id, secret }) {
    this.appId = id;
    this.appSecret = secret;
    this.request = axios.create({
      baseURL: 'https://api.ciscospark.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  generateId(cb?: any): any {
    return uniqid();
  }

  generateJwt({ userid, displayName }): any {
    return new Promise((resolve, reject) => {
      const payload = {
        sub: userid || uniqid(),
        name: displayName,
        iss: this.appId,
        exp: Math.round(Date.now()/1000) + (90*60) // 6hrs
      };
      const decoded = Buffer.from(this.appSecret, 'base64');
      jwt.sign(payload, decoded, {
        algorithm: 'HS256',
        noTimestamp: true
      }, (e, token) => {
        if(e) reject(e);
        else resolve(token);
      });
    })
  }

  getAccessTokenExpiration(expiresIn) {
    return moment().add(expiresIn, 'seconds').format();
  }
  
  retreiveAccessToken(jwt) {
    return this.request({
      url: '/jwt/login',
      method: 'post',
      headers: { Authorization: `Bearer ${jwt}` }
    }).then((resp: AxiosResponse): any => {
      if(!resp.data || !resp.data.token) {
        return Promise.reject({
          error: 'failed to generate an access token: bad response'
        });
      } else {
        const formattedExpiration =
          this.getAccessTokenExpiration(resp.data.expiresIn);
        return {
          token: resp.data.token,
          expiresIn: resp.data.expiresIn,
          formattedExpiration
        };
      }
    })
  }
  
  verifyToken(token) {
    return jwt.decode(token, { complete: true });
  }

  getGuest(token) {
    return this.request({
      url: '/people/me',
      method: 'get',
      headers: { Authorization: `Bearer ${token}` }
    }).then(resp => resp.data);
  }

  makeRequest({url, token, method, data}) {
    return this.request({
      url,
      method,
      data,
      headers: { Authorization: `Bearer ${token} ` }
    }).then(resp => resp.data);
  }
}