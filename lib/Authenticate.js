import fs from 'fs-extra';
import os from 'os';
import {AuthenticationError} from './Errors';

class Authenticate {
  constructor() {
    this.storeFile = os.homedir() + '/.dharma/auth.json';
  }

  async getAuthKey() {
    try {
      const auth = await fs.readJson(this.storeFile);
      return auth.key;
    } catch (err) {
      throw new AuthenticationError('Auth key file does not exist or is unreadable.')
    }
  }

  async setAuthKey(key) {
    await fs.outputJson(this.storeFile, { key: key })
  }
}

module.exports = Authenticate;
