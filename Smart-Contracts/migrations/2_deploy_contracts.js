var TollBoothsManager = artifacts.require("./TollBoothsManager.sol");

module.exports = function(deployer) {
  deployer.deploy(TollBoothsManager);
};
