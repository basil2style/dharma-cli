import os from 'os';
import fs from 'fs-extra';
import Constants from '../Constants';

const LIABILITIES_STORE_FILE = os.homedir() + '/.dharma/liabilities.json';

class Liabilities {
  constructor(loans = {}) {
    this.loans = loans;
  }

  static async load(dharma) {
    let raw;
    try {
      raw = await fs.readJson(LIABILITIES_STORE_FILE);
    } catch (err) {
      throw new Error('Liabilities store file does not exist.');
    }

    let loans = {};
    const promises = raw.map((uuid) => {
      return new Promise(async function(resolve, reject) {
        try {
          const loan = await dharma.loans.get(uuid);
          if (loan.state === Constants.ACCEPTED_STATE) {
            loans[uuid] = loan;
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    })

    await Promise.all(promises).catch((err) => { throw err });

    return new Liabilities(loans);
  }

  async save() {
    let raw = this.toJson();
    await fs.outputJson(LIABILITIES_STORE_FILE, raw);
  }

  toJson() {
    return Object.keys(this.loans);
  }

  addLoan(loan) {
    this.loans[loan.uuid] = loan;
  }
}

module.exports = Liabilities;
