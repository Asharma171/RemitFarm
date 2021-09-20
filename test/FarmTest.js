const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require("@openzeppelin/test-helpers");

const { assert, expect } = require("chai");
const { increase } = require("@openzeppelin/test-helpers/src/time");
const Remit = artifacts.require("Remit");
const RemitFarm = artifacts.require("RemitVaultFarmEth");
const AStoken = artifacts.require("AStoken");

contract("Remit Farm", () => {
  it("", async () => {
    const remit = await Remit.deployed();
    const remitfarm = await RemitFarm.deployed();
    const tokenOther = await AStoken.deployed();

    assert(remit.address !== "");
    assert(remitfarm.address !== "");
    assert(tokenOther.address !== "");
  });

  beforeEach(async function () {
    remit = await Remit.new();
    remitfarm = await RemitFarm.new()
    tokenOther = await AStoken.new();
    accounts = await web3.eth.getAccounts();
  });

  describe("[Testcase 1: Deposit  tokens ]", () => {
    it("Deposit ", async () => {
      await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("300","ether"));
      await remit.setFarmAddress(remitfarm.address);
      await remitfarm.setRewardTokenAddress(remit.address);
      await remitfarm.setDepositTokenAddress(tokenOther.address);
      await tokenOther.transfer(accounts[2],web3.utils.toWei("100","ether"));
      await tokenOther.approve(remitfarm.address,web3.utils.toWei("55","ether"),{from:accounts[2]});
      await remitfarm.deposit(web3.utils.toWei("20","ether"),{from : accounts[2]});
      await remitfarm.deposit(web3.utils.toWei("10","ether"),{from : accounts[2]});
      var actual = await remitfarm.depositedTokens( accounts[2]);
      var expected = web3.utils.toWei("30","ether");
      assert.equal(actual,expected);

      await time.increase(time.duration.days(45));

      await remitfarm.deposit(web3.utils.toWei("15","ether"),{from : accounts[2]});
      
      actual = await remit.stakeFarmSupply();
      expected = web3.utils.toWei("350000","ether");
      assert.notEqual(actual,expected);

    });
  });

  describe("[Testcase 2: Withdraw tokens ]", () => {
    it("withdraw", async () => {
        await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("300","ether"));
        await remit.setFarmAddress(remitfarm.address);
        await remitfarm.setRewardTokenAddress(remit.address);
        await remitfarm.setDepositTokenAddress(tokenOther.address);
        await tokenOther.transfer(accounts[2],web3.utils.toWei("250","ether"));
        await tokenOther.approve(remitfarm.address,web3.utils.toWei("100","ether"),{from:accounts[2]});
        await remitfarm.deposit(web3.utils.toWei("40","ether"),{from : accounts[2]});
        await remitfarm.deposit(web3.utils.toWei("30","ether"),{from : accounts[2]});

        await time.increase(time.duration.days(56));
        
        await remitfarm.withdraw(web3.utils.toWei("29","ether"),{from : accounts[2]});

        var actual = await remitfarm.totalTokens();
        var expected = web3.utils.toWei("41","ether");
        assert.equal(actual,expected);
    } );
  });

  describe("[Testcase 3: Deposit non trusted tokens ]", () => {
    it("Deposit ", async () => {
      await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("400","ether"));
      await remit.setFarmAddress(remitfarm.address);
      await remitfarm.setRewardTokenAddress(remit.address);
      await tokenOther.transfer(accounts[6],web3.utils.toWei("200","ether"));
      await tokenOther.approve(remitfarm.address,web3.utils.toWei("200","ether"),{from:accounts[6]});
      try{
        await remitfarm.deposit(web3.utils.toWei("80","ether"),{from : accounts[6]});
      }
      catch{
        var actual = await remitfarm.depositedTokens( accounts[6]);
        var expected = 0;
        assert.equal(actual,expected);
      }
    }); 
  }); 
  
  describe("[Testcase 4: Emergency Withdraw ]", () => {
    it("Emergency Withdraw", async () => {
      await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("200","ether"));
      await remit.setFarmAddress(remitfarm.address);
      await remitfarm.setRewardTokenAddress(remit.address);
      await remitfarm.setDepositTokenAddress(tokenOther.address);
      await tokenOther.transfer(accounts[2],web3.utils.toWei("80","ether"));
      await tokenOther.approve(remitfarm.address,web3.utils.toWei("65","ether"),{from:accounts[2]});
      await remitfarm.deposit(web3.utils.toWei("40","ether"),{from : accounts[2]});

      await time.increase(time.duration.hours(84));
     
      await remitfarm.emergencyWithdraw(web3.utils.toWei("28","ether"),{from : accounts[2]});
      var actual = await remitfarm.totalEarnedTokens(accounts[2]);
      var expected = 0;
      assert.equal(actual,expected);
    });
  });

  describe("[Testcase 5: To deposit and withdraw ]", () => {
    it("Deposit and Withdraw Tokens", async () => {
      await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("500","ether"));
      await remit.setFarmAddress(remitfarm.address);
      await remitfarm.setRewardTokenAddress(remit.address);
      await remitfarm.setDepositTokenAddress(tokenOther.address);

      await tokenOther.transfer(accounts[5],web3.utils.toWei("200","ether"));
      await tokenOther.approve(remitfarm.address,web3.utils.toWei("155","ether"),{from:accounts[5]});
      await remitfarm.deposit(web3.utils.toWei("40","ether"),{from : accounts[5]});

      await tokenOther.transfer(accounts[6],web3.utils.toWei("45","ether"));
      await tokenOther.approve(remitfarm.address,web3.utils.toWei("30","ether"),{from:accounts[6]});
      await remitfarm.deposit(web3.utils.toWei("25","ether"),{from : accounts[6]});

      await remitfarm.deposit(web3.utils.toWei("10","ether"),{from : accounts[5]});

      await time.increase(time.duration.days(56));
          
      await remitfarm.withdraw(web3.utils.toWei("18","ether"),{from : accounts[5]});

      var actual = await remit.stakeFarmSupply();
      var expected = web3.utils.toWei("350000","ether");
      assert.notEqual(actual,expected);

    });
  });

});
