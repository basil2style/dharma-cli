import Contract from 'truffle-contract'
import Metadata from '../../package.json';
import loanArtifact from '../../contracts/Loan.json'
import versionRegisterArtifact from '../../contracts/VersionRegister.json'
import semver from 'semver';

class LoanContract {
  static async instantiate(web3, metadata=Metadata) {
    const VersionRegister = new Contract(versionRegisterArtifact)
    const Loan = new Contract(loanArtifact)

    VersionRegister.defaults({ from: web3.eth.defaultAccount });
    Loan.defaults({ from: web3.eth.defaultAccount });

    VersionRegister.setProvider(web3.currentProvider);
    Loan.setProvider(web3.currentProvider)

    const versionRegisterInstance = await VersionRegister.deployed();

    const contractVersion = await versionRegisterInstance.currentVersion.call();
    const localVersion = {
      major: 0,
      minor: 1,
      patch: 0
    }

    if (contractVersion[0] != localVersion.major ||
        contractVersion[1] != localVersion.minor ||
        contractVersion[2] != localVersion.patch) {
      throw new Error('This version of dharma.js is trying to access a ' +
              'deprecated version of the Dharma Protocol contract.  This can ' +
              'be resolved by upgrading the dharma.js package.')
    }


    const loanContractAddress =
      await versionRegisterInstance.getContractByVersion.call(
        localVersion.major,
        localVersion.minor,
        localVersion.patch
      )

    return await Loan.deployed();
  }
}

module.exports = LoanContract;
