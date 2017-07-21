var Mortal = artifacts.require("./Mortal.sol");
var Lotthereum = artifacts.require("./Lotthereum.sol");

module.exports = function(deployer) {
    hash = '0x93036b147316017199338e191dbff124b5358520517f23a4b38db9769850f4ca';
    deployer.deploy(Mortal);
    deployer.link(Mortal, Lotthereum);
    // deployer.deploy(Lotthereum, 1, 20, 100000000000000000, 1000000000000000000, hash);
    deployer.deploy(Lotthereum);
};
