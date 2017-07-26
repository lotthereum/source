var Lotthereum = artifacts.require("./Lotthereum.sol");

contract('Lotthereum', function(accounts) {
  it("should allow owner to create multiple games", function(done) {
    var lotthereum;
    Lotthereum.deployed().then(function(instance) {
      watcher = instance.RoundOpen({origin: accounts[0]});

      instance.createGame(1, 20, 2, 20, {from: accounts[0]}).then(function() {
        return watcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.gameId.valueOf(), 0);
        assert.equal(events[0].args.roundId.valueOf(), 0);

        instance.createGame(2, 10, 5, 50, {from: accounts[0]}).then(function() {
          return watcher.get();
        }).then(function(events) {
          assert.equal(events.length, 1);
          assert.equal(events[0].args.gameId.valueOf(), 1);
          assert.equal(events[0].args.roundId.valueOf(), 0);

          instance.createGame(3, 10, 1, 10, {from: accounts[0]}).then(function() {
            return watcher.get();
          }).then(function(events) {
            assert.equal(events.length, 1);
            assert.equal(events[0].args.gameId.valueOf(), 2);
            assert.equal(events[0].args.roundId.valueOf(), 0);
            done();
          });
        });
      });
    });
  });

  it("should allow owner to close games", function(done) {
    var lotthereum;
    Lotthereum.deployed().then(function(instance) {
      var watcher = instance.GameClosed({gameId: 2});
      instance.closeGame(2, {from: accounts[0]}).then(function() {
        return watcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.gameId, 2);

        instance.getGames().then(function(games) {
          assert.equal(games.length, 2);
          assert.equal(games[0].valueOf(), 0);
          assert.equal(games[1].valueOf(), 1);
        }).then(done).catch(done);
      });
    });
  });

  it("should allow owner to open games", function(done) {
    var lotthereum;
    Lotthereum.deployed().then(function(instance) {
      var watcher = instance.GameOpened({gameId: 2});
      instance.openGame(2, {from: accounts[0]}).then(function() {
        return watcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.gameId, 2);

        instance.getGames().then(function(games) {
          assert.equal(games.length, 3);
          assert.equal(games[0].valueOf(), 0);
          assert.equal(games[1].valueOf(), 1);
          assert.equal(games[2].valueOf(), 2);
        }).then(done).catch(done);
      });
    });
  });

  it("should allow clients to get the current games", function(done) {
    var lotthereum;
    Lotthereum.deployed().then(function(instance) {
      return instance.getGames().then(function(games) {
        assert.equal(games.length, 3);
        assert.equal(games[0].valueOf(), 0);
        assert.equal(games[1].valueOf(), 1);
        assert.equal(games[2].valueOf(), 2);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get a game current round id", function(done) {
    var lotthereum;
    Lotthereum.deployed().then(function(instance) {
      return instance.getGameCurrentRoundId(0).then(function(roundId) {
        assert.equal(roundId.valueOf(), 0);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to know if the round is open", function(done) {
    var lotthereum;
    var gameId = 0;
    var roundId = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getGameRoundOpen(gameId, roundId).then(function(roundOpen) {
        assert.isTrue(roundOpen);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the minimum bet amount of a game", function(done) {
    var lotthereum;
    var gameId = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getGameMinAmountByBet(gameId).then(function(minBet) {
        assert.equal(minBet, 2);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the maximum number of bets of a game", function(done) {
    var lotthereum;
    var gameId = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getGameMaxNumberOfBets(gameId).then(function(maxNumberOfBets) {
        assert.equal(maxNumberOfBets, 20);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the prize of a game", function(done) {
    var lotthereum;
    var gameId = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getGamePrize(gameId).then(function(prize) {
        assert.equal(prize, 20);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the number of bets already placed in a game round", function(done) {
    var lotthereum;
    var gameId = 0;
    var roundId = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundNumberOfBets(gameId, roundId).then(function(numberOfBets) {
        assert.equal(numberOfBets, 0);
      }).then(done).catch(done);
    });
  });

  it("should emit a BetPlaced event for every bet placed", function(done) {
    var lotthereum;
    var account = accounts[1];
    var gameId = 0;
    var roundId = 0;
    Lotthereum.deployed().then(function(instance) {
      var watcher = instance.BetPlaced({origin: account});
      instance.placeBet(gameId, 0, {from: account, value: 2}).then(function() {
        return watcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.origin, account);
      }).then(done).catch(done);
    });
  });

  it("should reject bets with value less than the game minAmountByBet", function(done) {
    var lotthereum;
    var account = accounts[1];
    var gameId = 0;
    Lotthereum.deployed().then(function(instance) {
      instance.placeBet(gameId, 0, {from: account, value: 1}).then(function(result) {
        assert.isNotNull(result.tx);
        assert.equal(result.receipt.logs.length, 0);
      }).then(done).catch(done);
    });
  });

  it("should allow 18 bets to be placed", function(done) {
    var lotthereum;
    var account = accounts[1];
    var gameId = 0;
    var roundId = 0;
    Lotthereum.deployed().then(function(instance) {

      watcher = instance.BetPlaced({origin: account});
      for (var i = 1; i <= 9; i++) {
        instance.placeBet(gameId, i, {from: account, value: 2}).then(function() {
          return watcher.get();
        }).then(function(events) {
          assert.equal(events.length, 1);
          assert.equal(events[0].args.origin, account);
        })
      }

      account = accounts[2];
      watcher = instance.BetPlaced({origin: account});
      for (var i = 0; i <= 8; i++) {
        instance.placeBet(gameId, i, {from: account, value: 2}).then(function() {
          return watcher.get();
        }).then(function(events) {
          assert.equal(events.length, 1);
          assert.equal(events[0].args.origin, account);
        })
      }

      done();
    });
  });

  it("should close the round when the last bet is placed", function(done) {
    var lotthereum;
    var account = accounts[2];
    var gameId = 0;
    var roundId = 0;
    var next_round = 1;
    var prize = 20;
    var maxNumberOfBets = 20;
    var minAmountByBet = 2;

    Lotthereum.deployed().then(function(instance) {
      var betPlacedWatcher = instance.BetPlaced({origin: account});
      var roundWinnerWatcher = instance.RoundWinner();
      var roundCloseWatcher = instance.RoundClose({gameId: gameId, roundId: roundId});
      var roundOpenWatcher = instance.RoundOpen({id: next_round});
      instance.placeBet(gameId, 9, {from: account, value: 2}).then(function() {
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
        assert.equal(events[0].args.gameId, gameId);
        assert.equal(events[0].args.roundId, roundId);
        return roundOpenWatcher.get();
      }).then(function(events) {
        assert.equal(events.length, 1);
        assert.equal(events[0].args.gameId, gameId);
        assert.equal(events[0].args.roundId, next_round);
      }).then(done).catch(done);
    });
  });

  it("should allow clients to get the lucky number of a past round", function(done) {
    var lotthereum;
    var gameId = 0;
    var roundId = 0;
    Lotthereum.deployed().then(function(instance) {
      return instance.getRoundNumber(gameId, roundId).then(function(luckyNumber) {
        assert.isNotNull(luckyNumber);
      }).then(done).catch(done);
    });
  });

  it("should split the prize equaly by the round winners", function(done) {
    var lotthereum;
    var account = accounts[1];
    Lotthereum.deployed().then(function(instance) {
      instance.getBalance({from: account}).then(function(balance) {
        assert.equal(balance.valueOf(), 10);
      });
      account = accounts[2];
      instance.getBalance({from: account}).then(function(balance) {
        assert.equal(balance.valueOf(), 10);
      });
    });
    done();
  });

  it("should run automatically without mannual intervention... lets place 50 bets", function(done) {
    var lotthereum;
    var account = accounts[0];
    var gameId = 2;
    Lotthereum.deployed().then(function(instance) {
      var nextRoundId = 1;
      var numberOfRoundsOpenned = 0;

      var watcher = instance.BetPlaced({origin: account});
      var roundOpenWatcher = instance.RoundOpen({id: nextRoundId});

      var bet = -1;
      for (var i = 1; i <= 10; i++) {

        bet++;
        if (bet > 9) {
          bet = 0;
        }
        instance.placeBet(gameId, bet, {from: account, value: 5}).then(function() {
          return watcher.get();
        }).then(function(events) {
          if (typeof events != 'undefined') {
            if (events.length > 0) {
              assert.equal(events[0].args.origin, account);
              return roundOpenWatcher.get();
            }
          }
        }).then(function(events) {
          if (typeof events != 'undefined') {
            if (events.length > 0) {
              assert.equal(events.length, 1);
              assert.equal(events[0].args.gameId.valueOf(), gameId);
              assert.equal(events[0].args.roundId.valueOf(), 1);
              numberOfRoundsOpenned++;
              nextRoundId++;
              return numberOfRoundsOpenned;
            }
          }
        }).then(function(numberOfRoundsOpenned) {
          if (numberOfRoundsOpenned == 10) {
            done();
          }
        })
      }
    });
  });

});
