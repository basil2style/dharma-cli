import fs from 'fs-extra';
import os from 'os';
import {AuthenticationError} from './Errors';

class Authenticate {
  constructor() {
    this.storeFile = os.homedir() + '/.dharma/auth.json';
  }

  async getAuthToken() {
    try {
      const auth = await fs.readJson(this.storeFile);
      return auth.token;
    } catch (err) {
      throw new AuthenticationError('Auth token file does not exist or is unreadable.')
    }
  }

  async setAuthToken(token) {
    await fs.outputJson(this.storeFile, { token: token })
  }
}

module.exports = Authenticate;
