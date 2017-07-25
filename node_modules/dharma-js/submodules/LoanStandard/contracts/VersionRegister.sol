pragma solidity ^0.4.8;

/**
 * @title VersionRegsiter
 *
 * @dev Simple register for exposing current and previous Loan contract
 *      addresses.  Client libraries should always query the VersionRegister
 *      first before attempting to reach the Loan contract in order to receive
 *      the desired contract address.
 */

contract VersionRegister {
  mapping (bytes32 => address) versionMapping;

  struct Version {
    uint major;
    uint minor;
    uint patch;
  }

  Version public currentVersion;
  address public owner;

  modifier onlyOwner() {
    if (msg.sender != owner)
      throw;
    _;
  }

  function VersionRegister() {
    owner = msg.sender;
  }

  function getContractByVersion(uint major, uint minor, uint patch) returns (address) {
    return versionMapping[sha3(major, minor, patch)];
  }

  function updateCurrentVersion(uint major, uint minor, uint patch) onlyOwner {
    currentVersion = Version(major, minor, patch);
  }

  function updateVersionMapping(uint major, uint minor, uint patch, address contractAddress)
    onlyOwner
  {
    versionMapping[sha3(major, minor, patch)] = contractAddress;
  }
}
