const {
    BN, constants, expectEvent, expectRevert, time,
  } = require("@openzeppelin/test-helpers");
  
const { assert, expect } = require("chai");
const Remit = artifacts.require("Remit");

contract("remit", () => {
    beforeEach(async function () {
      remit = await Remit.new();
      accounts = await web3.eth.getAccounts();
    });

    it("Mint Circulation Supply", async () => {

        var actual = await remit.circulationSupply();
        var expected = web3.utils.toWei("370000","ether");
        assert.equal(actual,expected);
        await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("60","ether"));
        actual = await remit.balanceOf(accounts[0]);
        expected = web3.utils.toWei("60","ether");
        assert.equal(actual,expected);
    });

    it("Supply can't exceeding Limit", async () => {

        try{
        await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("390000","ether"));
        }
        catch{
        }
        var actual = await remit.circulationSupply();
        assert.equal(actual,web3.utils.toWei("370000","ether"));
    });

    it("Mint Developer Supply (before unlock time)", async () => {
        try{
        await remit.mintDevFundSupply(accounts[2],web3.utils.toWei("165","ether"));
        }
        catch{
        }
        var actual = await remit.devFundSupply();
        var expected = 0;
        assert.equal(actual,expected);
    });

    it("Mint Developer Supply (after unlock time)", async () => {

        await time.increase(time.duration.days(56));

        await remit.mintDevFundSupply(accounts[2],web3.utils.toWei("165","ether"));
        actual = await remit.devFundSupply();
        expected = web3.utils.toWei("23835","ether");
        assert.equal(actual,expected);

    });

    it("Mint StakeFarm Supply", async () => {

        var actual = await remit.stakeFarmSupply();
        var expected = web3.utils.toWei("350000","ether");
        assert.equal(actual,expected);
        
        await remit.setStakeAddress(accounts[0]);
        await remit.mintStakeFarmSupply(accounts[5],web3.utils.toWei("799","ether"));

        actual = await remit.stakeFarmSupply();
        expected = web3.utils.toWei("349201","ether");
        assert.equal(actual,expected);

    });

    it("Mint StakeFarm Supply to non stakefarm address", async () => {
        try{
        await remit.mintStakeFarmSupply(accounts[5],web3.utils.toWei("899","ether"));
        }
        catch{
        }
    });

    it("Dev count", async () => {
        let devCount = await remit.devFundCounter();
        let actual = await remit.devFundSupplyUnlockSupply(devCount+2);
        assert.equal(actual,0);
    });
    
    it("Mint Marketing Supply", async () => {

        var actual = await remit.marketingSupply();
        var expected = web3.utils.toWei("50000","ether");
        assert.equal(actual,expected);

        await remit.mintMarketingSupply(accounts[8],web3.utils.toWei("1250","ether"));
        await remit.mintMarketingSupply(accounts[9],web3.utils.toWei("695","ether"));
        actual = await remit.marketingSupply();
        expected = web3.utils.toWei("48055","ether");
        assert.equal(actual,expected);
    });

});
