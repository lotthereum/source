var Lotthereum = artifacts.require("./Lotthereum.sol");

hash = '0x93036b147316017199338e191dbff124b5358520517f23a4b38db9769850f4ca';
blockPointer = 1;
maxNumberOfBets = 20;
minAmountByBet = 100000000000000000;
prize = 1000000000000000000;

contract('Lotthereum', function(accounts) {
  it("should allow clients to get the current round id", function(done) {
    var lotthereum;
    Lotthereum.deployed().then(function(instance) {
      return instance.getCurrentRoundId().then(function(roundId) {
        assert.equal(roundId, 0);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to know if the round is open", function(done) {
    var lotthereum;
    var round = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundOpen(round).then(function(roundOpen) {
        assert.isTrue(roundOpen);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the minimum bet amount of a round", function(done) {
    var lotthereum;
    var round = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundMinAmountByBet(round).then(function(minBet) {
        assert.equal(minBet, 100000000000000000);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the maximum number of bets of a round", function(done) {
    var lotthereum;
    var round = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundMaxNumberOfBets(round).then(function(maxNumberOfBets) {
        assert.equal(maxNumberOfBets, 20);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the prize of a round", function(done) {
    var lotthereum;
    var round = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundPrize(round).then(function(prize) {
        assert.equal(prize, 1000000000000000000);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the number of bet already placed in a round", function(done) {
    var lotthereum;
    var round = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundNumberOfBets(round).then(function(numberOfBets) {
        assert.equal(numberOfBets, 0);
      }).then(done).catch(done);
    });
  });

  it("should emit a BetPlaced events for every bet placed", function(done) {
    var lotthereum;
    var account;
    Lotthereum.deployed().then(function(instance) {
      account = accounts[1];
      var watcher = instance.BetPlaced({origin: account});
      instance.bet(0, {from: account, value: 100000000000000000}).then(function() {
        return watcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.origin, account);
      }).then(done).catch(done);
    });
  });

  it("should reject bets with value less than the round minAmountByBet", function(done) {
    var lotthereum;
    var account;
    Lotthereum.deployed().then(function(instance) {
      account = accounts[1];
      return instance.bet(1, {from: account, value: 1}).then(function(result) {
        assert.isNotNull(result.tx);
        assert.equal(result.receipt.logs.length, 0);
      }).then(done).catch(done);
    });
  });

  it("should allow 17 bets to be placed", function(done) {
    var lotthereum;
    var account;
    Lotthereum.deployed().then(function(instance) {
      account = accounts[1];
      watcher = instance.BetPlaced({origin: account});
      for (var i = 1; i <= 9; i++) {
        instance.bet(i, {from: account, value: 100000000000000000}).then(function() {
          return watcher.get();
        }).then(function(events) {
          assert.equal(events.length, 1);
          assert.equal(events[0].args.origin, account);
        })
      }

      account = accounts[2];
      watcher = instance.BetPlaced({origin: account});
      for (var i = 0; i <= 8; i++) {
        instance.bet(i, {from: account, value: 100000000000000000}).then(function() {
          return watcher.get();
        }).then(function(events) {
          assert.equal(events.length, 1);
          assert.equal(events[0].args.origin, account);
        })
      }

      done();

      // then(done).catch(done);

      // var watcher1 = instance.BetPlaced({origin: accounts[1]});
      // var watcher1 = instance.BetPlaced({origin: account});

      // // 8 bets from accounts[1]
      // instance.bet(2, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(3, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(4, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(5, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(6, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(7, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(8, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(9, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // }).then(function(events) {

      // account = accounts[2];
      // var watcher = instance.BetPlaced({origin: account});
      // // 9 bets from accounts[2]
      // instance.bet(1, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(2, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(3, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(4, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(5, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(6, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(7, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // })
      // instance.bet(8, {from: account, value: 100000000000000000}).then(function() {
      //   return watcher.get();
      // }).then(function(events) {
      //   assert.equal(events.length, 1);
      //   assert.equal(events[0].args.origin, account);
      // }).then(done).catch(done);
    });
  });

  it("should close the round when the last bet is placed", function(done) {
    var lotthereum;
    var account = accounts[2];
    var round = 0;
    var next_round = 1;
    Lotthereum.deployed().then(function(instance) {
      var betPlacedWatcher = instance.BetPlaced({origin: account});
      var roundWinnerWatcher = instance.RoundWinner();
      var roundCloseWatcher = instance.RoundClose({id: round});
      var roundOpenWatcher = instance.RoundOpen({id: next_round});
      instance.bet(9, {from: account, value: 100000000000000000}).then(function() {
        return betPlacedWatcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.origin, account);
        return roundWinnerWatcher.get();
      }).then(function(events) {
        assert.equal(events.length, 2);
        assert.isTrue(events[0].args.winnerAddress == accounts[1] || events[0].args.winnerAddress == accounts[2])
        assert.equal(events[0].args.amount, prize / 2);
        return roundCloseWatcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.id, round);
        return roundOpenWatcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.id, next_round);
        assert.equal(events[0].args.maxNumberOfBets, maxNumberOfBets);
        assert.equal(events[0].args.minAmountByBet, minAmountByBet);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the lucky number of a round", function(done) {
    var lotthereum;
    var round = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundNumber(round).then(function(luckyNumber) {
        assert.isNotNull(luckyNumber);
      }).then(done).catch(done);
    });
  });

  it("should split the prize equaly by the round winners", function(done) {
    var lotthereum;
    var round = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundNumber(round).then(function(luckyNumber) {
        assert.isNotNull(luckyNumber);
      }).then(done).catch(done);
    });
  });


  // it("should reject bets with value less than the round minAmountByBet", function(done) {
  //   var lotthereum;
  //   var account = accounts[1];
  //   Lotthereum.deployed().then(function(instance) {
  //     var watcher = instance.BetPlaced();
  //     return instance.bet(1, {from: account, value: 1}).then(function(result) {
  //       assert.isNotNull(result.tx);
  //       assert.equal(result.receipt.logs.length, 0);
  //     }).then(done).catch(done);
  //   });
  // });

  // it("should be able to get number of bets", function(done) {
  //   var lotthereum;
  //   var account = accounts[1];
  //   Lotthereum.deployed().then(function(instance) {
  //     var watcher = instance.BetPlaced();
  //     return instance.bet(1, {from: account, value: 100000000000000000}).then(function(result) {
  //       assert.isNotNull(result.tx);
  //       assert.equal(result.receipt.logs.length, 1);
  //       return instance.getRoundNumberOfBets(0).then(function(numberOfBets) {
  //         console.log('>>' + numberOfBets);
  //       });
  //     }).then(done).catch(done);
  //   });
  // });

});
