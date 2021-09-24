const {BN, constants, expectEvent, expectRevert, time,} 
  = require("@openzeppelin/test-helpers");

const { assert, expect } = require("chai");
const { increase } = require("@openzeppelin/test-helpers/src/time");
const Remit = artifacts.require("Remit");
const RemitFarm = artifacts.require("RemitVaultFarmEth");
const AStoken = artifacts.require("AStoken");

contract("Remit Farm", () => {

  beforeEach(async function () {
    remit = await Remit.new();
    remitfarm = await RemitFarm.new()
    ASt = await AStoken.new();
    accounts = await web3.eth.getAccounts();
  });

 

  it("Deposit ", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("300","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);
    await ASt.transfer(accounts[2],web3.utils.toWei("100","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("55","ether"),{from:accounts[2]});
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
  

  
  it("withdraw", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("300","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);
    await ASt.transfer(accounts[2],web3.utils.toWei("250","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("100","ether"),{from:accounts[2]});
    await remitfarm.deposit(web3.utils.toWei("40","ether"),{from : accounts[2]});
    await remitfarm.deposit(web3.utils.toWei("30","ether"),{from : accounts[2]});

    await time.increase(time.duration.days(56));
        
    await remitfarm.withdraw(web3.utils.toWei("29","ether"),{from : accounts[2]});

    var actual = await remitfarm.totalTokens();
    var expected = web3.utils.toWei("41","ether");
    assert.equal(actual,expected);
  });
  

  
  it("Deposit non trusted token ", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("400","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await ASt.transfer(accounts[6],web3.utils.toWei("200","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("200","ether"),{from:accounts[6]});
    try{
      await remitfarm.deposit(web3.utils.toWei("80","ether"),{from : accounts[6]});
    }
    catch{
      var actual = await remitfarm.depositedTokens( accounts[6]);
      var expected = 0;
      assert.equal(actual,expected);
    }
  }); 
  
  
  
  it("Emergency Withdraw", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("200","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);
    await ASt.transfer(accounts[2],web3.utils.toWei("80","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("65","ether"),{from:accounts[2]});
    await remitfarm.deposit(web3.utils.toWei("40","ether"),{from : accounts[2]});

    await time.increase(time.duration.hours(84));
    
    await remitfarm.emergencyWithdraw(web3.utils.toWei("28","ether"),{from : accounts[2]});
    var actual = await remitfarm.totalEarnedTokens(accounts[2]);
    var expected = 0;
    assert.equal(actual,expected);
  });


  
  it("Deposit and Withdraw Tokens", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("500","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);

    await ASt.transfer(accounts[5],web3.utils.toWei("200","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("155","ether"),{from:accounts[5]});
    await remitfarm.deposit(web3.utils.toWei("40","ether"),{from : accounts[5]});

    await remitfarm.deposit(web3.utils.toWei("10","ether"),{from : accounts[5]});

    await time.increase(time.duration.days(56));
        
    await remitfarm.withdraw(web3.utils.toWei("18","ether"),{from : accounts[5]});

    var actual = await remit.stakeFarmSupply();
    var expected = web3.utils.toWei("350000","ether");
    assert.notEqual(actual,expected);

  });


  it("getNumberOfHolders", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("300","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);
    await ASt.transfer(accounts[2],web3.utils.toWei("100","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("55","ether"),{from:accounts[2]});
    await remitfarm.deposit(web3.utils.toWei("20","ether"),{from : accounts[2]});
    
    it("No. of holders/stakers should increase", async () => {
    assert.notEqual(getNumberOfHolders,0);	
    });
    
  
  });
  
  
  it("withdraw won't work before cliff time", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("300","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);
    await ASt.transfer(accounts[4],web3.utils.toWei("100","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("100","ether"),{from:accounts[4]});
    await remitfarm.deposit(web3.utils.toWei("89","ether"),{from : accounts[4]});
    
    try{
      await remitfarm.withdraw(web3.utils.toWei("65","ether"),{from : accounts[4]});
    }
    catch{
    }
    var actual = await remitfarm.totalEarnedTokens(accounts[4]);
    var expected = 0;
    assert.equal(actual,expected);
  
  });

  
  it("totalEarnedTokens", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("400","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);
    await ASt.transfer(accounts[2],web3.utils.toWei("100","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("55","ether"),{from:accounts[2]});
    await remitfarm.deposit(web3.utils.toWei("20","ether"),{from : accounts[2]});
    var actual = await remitfarm.totalEarnedTokens(accounts[2]);

    it("total earned tokens should increase ", async () => {
      assert.notEqual(totalEarnedTokens,0);	
    });
    
  });

  it("Deposite won't work if there is NO circulation supply ", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("0","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);
    try{
      await remitfarm.deposit(web3.utils.toWei("80","ether"),{from : accounts[2]});
    }
    catch{
      var actual = await remitfarm.depositedTokens( accounts[2]);
      var expected = 0;
      assert.equal(actual,expected);
    }
  });
  
  it("Can't withdraw bcz of insufficient token ", async () => {
    await remit.mintCirculationSupply(accounts[0],web3.utils.toWei("400","ether"));
    await remit.setFarmAddress(remitfarm.address);
    await remitfarm.setRewardTokenAddress(remit.address);
    await remitfarm.setDepositTokenAddress(ASt.address);
    await ASt.transfer(accounts[2],web3.utils.toWei("100","ether"));
    await ASt.approve(remitfarm.address,web3.utils.toWei("55","ether"),{from:accounts[2]});
    await remitfarm.deposit(web3.utils.toWei("20","ether"),{from : accounts[2]});
    
    try{
      await remitfarm.withdraw(web3.utils.toWei("65","ether"),{from : accounts[4]});
    }
    catch{
    }
    var actual = await remitfarm.totalEarnedTokens(accounts[4]);
    var expected = 0;
    assert.equal(actual,expected);
  });

});
