function Lotthereum() {
    this.contract = web3.eth.contract([{'constant':false,'inputs':[{'name':'gameId','type':'uint256'}],'name':'openGame','outputs':[{'name':'','type':'bool'}],'payable':false,'type':'function'},{'constant':false,'inputs':[{'name':'gameId','type':'uint256'},{'name':'bet','type':'uint8'}],'name':'placeBet','outputs':[{'name':'','type':'bool'}],'payable':true,'type':'function'},{'constant':true,'inputs':[],'name':'getBalance','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':false,'inputs':[{'name':'gameId','type':'uint256'}],'name':'closeGame','outputs':[{'name':'','type':'bool'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'_a','type':'bytes32'}],'name':'getNumber','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':false,'inputs':[],'name':'withdraw','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':false,'inputs':[],'name':'kill','outputs':[],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'}],'name':'getGameRoundOpen','outputs':[{'name':'','type':'bool'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'}],'name':'getRoundPointer','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[],'name':'numberOfClosedGames','outputs':[{'name':'numberOfClosedGames','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getGameMinAmountByBet','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'}],'name':'getRoundNumberOfBets','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetOrigin','outputs':[{'name':'','type':'address'}],'payable':false,'type':'function'},{'constant':false,'inputs':[{'name':'pointer','type':'uint256'},{'name':'maxNumberOfBets','type':'uint256'},{'name':'minAmountByBet','type':'uint256'},{'name':'prize','type':'uint256'}],'name':'createGame','outputs':[{'name':'id','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[],'name':'getGames','outputs':[{'name':'ids','type':'uint256[]'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'}],'name':'getRoundNumber','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getGameCurrentRoundId','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetNumber','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getGameMaxNumberOfBets','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getPointer','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getGamePrize','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'i','type':'uint256'}],'name':'getBlockHash','outputs':[{'name':'blockHash','type':'bytes32'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetAmount','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'payable':true,'type':'fallback'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':true,'name':'roundId','type':'uint256'}],'name':'RoundOpen','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':true,'name':'roundId','type':'uint256'},{'indexed':false,'name':'number','type':'uint8'}],'name':'RoundClose','type':'event'},{'anonymous':false,'inputs':[{'indexed':false,'name':'maxNumberOfBets','type':'uint256'}],'name':'MaxNumberOfBetsChanged','type':'event'},{'anonymous':false,'inputs':[{'indexed':false,'name':'minAmountByBet','type':'uint256'}],'name':'MinAmountByBetChanged','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':true,'name':'roundId','type':'uint256'},{'indexed':true,'name':'origin','type':'address'},{'indexed':false,'name':'betId','type':'uint256'}],'name':'BetPlaced','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':true,'name':'roundId','type':'uint256'},{'indexed':true,'name':'winnerAddress','type':'address'},{'indexed':false,'name':'amount','type':'uint256'}],'name':'RoundWinner','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'}],'name':'GameOpened','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'}],'name':'GameClosed','type':'event'}]);

    this.contractInstance = this.contract.at(window.contract_address);
    this.modalIntro = 0;
    this.tabbed = 0;
    this.selectedGame = 0;
    this.eventsInitialized = false;
    this.games = [];
    var self = this;

    ///////////////////////////////////////////////////////////////////////////
    //
    //  INIT
    //
    this.init = function () {
        async.waterfall([
            function games(done) {
                self.contractInstance.getGames(function(error, result) {
                    console.log('result.valueOf(): ' + result.valueOf())
                    var games = result.valueOf();
                    for (var i = 0; i < games.length; i++) {
                        self.games.push(new Game(self, i));
                        self.addGamePlaceHolder(i);
                    }
                    done(error, self.games);
                });
            },
        ],
        function (err) {
            if (err) {
                console.error(err);
            }
        });
    };

    this.isInitialized = function (gameId, roundId) {
        var initialized = false;
        if (self.games[gameId]){
            if (self.games[gameId].rounds[roundId]) {
                self.games[gameId].rounds[roundId].rendered++;
                console.log('rendered: ' + self.games[gameId].rounds[roundId].rendered)
                console.log('numberOfBets: ' + self.games[gameId].rounds[roundId].numberOfBets)
                if (self.games[gameId].rounds[roundId].rendered >= self.games[gameId].rounds[roundId].numberOfBets) {
                    self.games[gameId].rounds[roundId].initialized = true;
                    initialized = true;
                }
            }
        }

        if (initialized) {
            console.log('GAME ' + gameId + ' INITIALIZED!');
            self.renderRound(gameId, roundId);

            if (!self.eventsInitialized) {
                self.eventsInitialized = true;
                this.initEvents();

                if(self.games[gameId].rounds[roundId].payload) {
                    if(self.games[gameId].rounds[roundId].payload.select) {
                        console.log('>>>>>>>>>>>>>>>>>>>>>>>>', self.payload);
                        $('ul.tabs').tabs('select_tab', '#game_' + self.gameId + '_holder');
                    }
                }
            }
        }
        return initialized;
    }

    this.areAllRoundsInitialed = function () {
        var ret = true;
        for (var i = 0; i <= self.currentRoundId; i++) {
            if (self.rounds[i].initialized == false) {
                ret = false;
            }
        }
        return ret
    }
    //
    //  INIT
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  PLACE BET
    //
    this.placeBet = function (gameId, bet) {
        var value = self.games[gameId].minAmount * 1000000000000000000
        var gas = 500000;
        console.log('sending from: ' + self.account)

        self.contractInstance.placeBet(gameId, bet, {from: self.account, value: value, gas: gas}, function(error, result) {
            if (error) {
                console.log('ERROR:');
                console.log(error);
            } else {
                $('#bet-btn').addClass('disabled');
                Materialize.fadeInImage('#confirmations');
                console.log(result);
            }
        });
    }
    //
    //  PLACE BET
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  WITHDRAW
    //
    this.withdraw = function () {
        var gas = 500000;
        console.log('withdraw from: ' + self.account)
        self.contractInstance.withdraw({from: self.account, gas: gas}, function(error, result) {
            $('#withdraw-btn').addClass('disabled');
            $('#withdraw-transaction-id').html(result)
            Materialize.fadeInImage('#withdraw-confirmations');
        });
    }
    //
    //  WITHDRAW
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  ACCOUNTS
    //
    this.initAccounts = function () {
        self.accounts = [];
        self.account = null;

        web3.eth.getAccounts(function(error, accounts) {
            var account = null;
            accounts.forEach(function(_account) {
                if (account == null) {
                    account = _account;
                }
                $('#dropdown-nav').append('<li class="valign-wrapper"><a href="#!' + _account + '" class="accounts_dropdown_item"><div class="eth-address square">' + _account + '</div> ' + _account + '</a></li>');
            });

            if (account != null) {
                self.changeAccount(account)
                $('#avatar').css('display', 'block');
            } else {
                console.log('No accounts found!');
                $('#alert1').modal('open');
            }

            $('select').material_select();

            $('.accounts_dropdown_item').click(function() {
                var newValue = $(this).attr('href').replace('#!', '');
                console.log(newValue);
                self.changeAccount(newValue)
            });
        });
    }

    this.changeAccount = function (address) {
        self.account = address;
        self.renderAvatar(self.account);
        $('#current_account_number').html(self.account);
        self.getBalance();
    }

    this.getBalance = function () {
        self.contractInstance.getBalance({from: self.account}, function(error, result){
            var balance = web3.fromWei(result.valueOf(), 'ether');
            $('#current_account_balance').html(balance + ' ETH');
            if (balance <= 0) {
                $('#withdraw-btn').addClass('disabled');
            } else {
                $('#withdraw-btn').removeClass('disabled');
            }
        });
    }
    //
    //  ACCOUNTS
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  EVENTS
    //
    this.initEvents = function () {
        var currentBlockNumber = 0;
        web3.eth.getBlockNumber(function(error, result){
            if(!error)
                currentBlockNumber = result;
            else
                console.error(error);
        })

        var range = {fromBlock: currentBlockNumber, toBlock: 'latest'};
        self.betPlacedEvent = self.contractInstance.BetPlaced(range);
        self.betPlacedEvent.watch(self.betPlaced);

        self.roundCloseEvent = self.contractInstance.RoundClose(range);
        self.roundCloseEvent.watch(self.roundClose);

        self.roundOpenEvent = self.contractInstance.RoundOpen(range);
        self.roundOpenEvent.watch(self.roundOpen);

        self.roundWinnerEvent = self.contractInstance.RoundWinner(range);
        self.roundWinnerEvent.watch(self.roundWinner);
    }

    this.roundClose = function (error, event) {
        console.log('round closed: ' + event.args.roundId + ' (game: ' + event.args.gameId);
        Materialize.toast('Game #' + event.args.gameId + '  Round #' + event.args.roundId + ' closed!', 5000, 'rounded');
    }

    this.roundOpen = function (error, event) {
        console.log('round opened: ' + event.args.roundId + ' (game: ' + event.args.gameId);
        Materialize.toast('Game #' + event.args.gameId + '  Round #' + event.args.roundId + ' opened!', 5000, 'rounded');
        self.games[event.args.gameId].init();
    }

    this.betPlaced = function (error, event) {
        if (error) {
            console.log('ERROR:');
            console.log(error);
        } else {
            console.log('betPlaced event origin: ' + event.args.origin);
            console.log('event.args.gameId: ' + event.args.gameId);
            console.log('event.args.roundId: ' + event.args.roundId);
            if (event.args.origin == self.account) {
                $('#bet-modal').modal('close');
                $('#bet-btn').removeClass('disabled');
                $('#confirmations').css('opacity', 0);
            }
            Materialize.toast('New bet placed', 5000, 'rounded');
            self.games[event.args.gameId].rounds[event.args.roundId].init({'select': true});
        }
    }

    this.roundWinner = function (error, event) {
        console.log('round winner: ' + event.args.winnerAddress + ' ' + web3.fromWei(event.args.amount, 'ether') + ' ETH');
        Materialize.toast('Round winner ' + event.args.winnerAddress, 5000, 'rounded');
        self.getBalance();
    }
    //
    //  EVENTS
    //
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    //
    //  RENDER
    //
    this.renderRound = function (gameId, roundId) {
        var game = self.games[gameId];
        var round = self.games[gameId].rounds[roundId];
        console.log(round)

        console.log('redering game #' + gameId + ' round #' + roundId);
        $('#rounds_' + gameId + ' #round_' + roundId + '_holder').html('');

        var html = $('#round_template').html();
        html = html.replace(/{round_id}/g, roundId);
        if (round.open) {
            html = html.replace('>lock<', '>lock_open<');
            html = html.replace('{color}', 'blue');
            var bet_btn_html = $('#bet_button_template').html().replace('{game_id}', gameId);
            html = html.replace('{betButton}', bet_btn_html);
        } else {
            html = html.replace('{color}', 'grey lighten-1');
        }
        html = html.replace(/{prize}/g, game.prize);
        html = html.replace('{minAmount}', game.minAmount);
        html = html.replace('{minAmount}', game.minAmount);
        html = html.replace('{numberOfBets}', round.numberOfBets);
        html = html.replace('{remaining}', round.remaining);
        html = html.replace(/{progress}/g, round.progress);

        // render bets
        var bets_html = ''
        var has_winner = false;
        for (var j = round.bets.length-1; j >= 0; j--) {
            var bet_html = $('#bet_template').html();

            if ((!round.open) && (round.bets[j].bet == round.number)) {
                bet_html = bet_html.replace(' {win}', ' green lighten-3');
                has_winner = true;
            } else {
                bet_html = bet_html.replace(' {win}', '');
            } 

            bet_html = bet_html.replace(/{bet_id}/g, round.bets[j].id);
            bet_html = bet_html.replace(/{origin}/g, round.bets[j].origin);
            bet_html = bet_html.replace(/{amount}/g, round.bets[j].amount);
            bets_html += bet_html;
        }
        html = html.replace('{bets}', bets_html);

        if (!round.open) {
            var btnHtml = $('#bet_number_template').html().replace(/{number}/g, round.number);
            if (has_winner) {
                btnHtml = btnHtml.replace('{color}', 'green');
                html = html.replace('{betButton}', btnHtml);
            } else {
                btnHtml = btnHtml.replace('{color}', 'red');
                html = html.replace('{betButton}', btnHtml);
            }
        }

        $('#rounds_' + gameId + ' #round_' + roundId + '_holder').html(html);
        $('#rounds_' + gameId + ' #round_' + roundId + '_progress').css('width', round.progress + '%');

        if (self.areAllRoundsInitialed()) {
            console.log('INITIALIZED!!!!');
            this.renderTabs();
            self.stopLoading();
        }
    }

    this.addGamePlaceHolder = function (gameId) {
        var html = $('#game_placeholder_template').html();
        html = html.replace(/{game_id}/g, gameId);
        $('#games-container').append(html);
    }

    this.addRoundPlaceHolder = function (gameId, roundId) {
        var html = $('#round_placeholder_template').html();
        html = html.replace(/{round_id}/g, roundId);
        $('#rounds_' + gameId).prepend(html);
    }

    this.stopLoading = function () {
        self.renderAllIdenticons();
        $('#loading').hide();
        $('.page-footer').css('display', 'block');
        $('.main-container').css('display', 'block');
        $('.navbar-fixed').css('display', 'block');
        $('.nav-wrapper').css('background', '#2196F3');
    }

    this.startLoading = function () {
        $('#loading').show();
        $('.page-footer').css('display', 'none');
        $('.main-container').css('display', 'none');
        $('.navbar-fixed').css('display', 'none');
        $('.nav-wrapper').css('background', 'white');
    }

    this.renderIdenticon = function (obj) {
        obj.style.backgroundImage = 'url(' + blockies.create({ seed:obj.innerHTML.toLowerCase(), size: 8, scale: 16}).toDataURL() + ')'
    }

    this.renderAllIdenticons = function () {
        $('.eth-address').each(function(i, obj) {
            self.renderIdenticon(obj)
        });
    }

    this.initUIElements = function () {
        $(document).ready(function() {
            $('.target').pushpin({top: 0, bottom: 1000, offset: 0});

            $('#bet-btn').click(function() {
                var bet = parseInt($('input[name=bet_pick]:checked').val());
                if (bet <= 9 && bet >= 0) {
                    self.placeBet(self.selectedGame, $('input[name=bet_pick]:checked').val());
                }
            });

            $('#withdraw-btn').click(function() {
                self.withdraw();
            });

            $('#close-intro-btn').click(function() {
                $('#intro').css('display', 'none');
            });

            $('#close-intro-btn').click(function() {
                $('#intro').css('display', 'none');
            });

            $('#logo-btn').click(function() {
                $('ul.tabs').tabs('select_tab', 'intro1');
            });

            $('#place-your-bet').click(function() {
                window.scrollTo(0, 0);
                $('ul.tabs').tabs('select_tab', 'game_3_holder');
            });

            $(window).scroll(function() {
                var opacity = 1 - $(window).scrollTop() / 70;
                if (opacity < 0) {
                    opacity = 0;
                }
                $('.tabs').css('opacity', opacity);
            });

            $('.modal').modal();

            $('.tooltipped').tooltip({delay: 60});

            $('.main-container').css('display', 'block');
        });
    }

    this.renderAvatar = function (address) {
        $('#avatar').html(address);
        $('#avatar').each(function(i, obj) {
            self.renderIdenticon(obj)
        });
    }

    this.renderTabs = function () {
        self.tabbed++;
        if (self.tabbed <= 1) {
            $('#tabs').html('<li class="tab col s2"><a class="active" href="#intro1">Lotthereum</a></li>');
            for (var i = this.games.length-1; i >= 0; i--) {
                $('#tabs').append('<li class="tab col s2"><a href="#game_' + this.games[i].id + '_holder">' + this.games[i].minAmount +' ETH</a></li>');
            }
            $('#tabs').append('<li class="tab col s2"><a href="#withdraw"><span class="new badge balance" data-badge-caption="ETH"></span>Withdraw</a></li>');
            $('#tabs').tabs({
                'swipeable': false,
                'onShow': function (tab) {
                    self.selectedGame = 0;
                    var gameId = parseInt(
                        tab.selector.replace('#game_', '').replace('_holder', '')
                    );
                    if (gameId >= 0) {
                        self.selectedGame = gameId;
                    }
                    console.log('SELECTED GAME: ' + self.selectedGame);
                },
            });
        }
    }
    //
    //  RENDER
    //
    ///////////////////////////////////////////////////////////////////////////

    this.init();
    this.initAccounts();
    this.initUIElements();
}

function Game(lotthereum, gameId) {
    this.id = gameId;
    this.lotthereum = lotthereum;
    this.contractInstance = lotthereum.contractInstance;

    this.rounds = [];
    this.currentRoundId = 0;
    this.minAmount = 0;
    this.maxNumber = 0;
    this.numberOfBets = 0;
    this.prize = 0;
    this.remaining = 0;
    this.progress = 0;
    this.number = -1;
    this.tabbed = 0;
    this.rounds = [];
    var self = this;

    this.init = function () {
        self.rounds = [];
        $('#rounds_' + self.id).html('');

        async.waterfall([
            function(done) {
                console.log(self.id)
                self.contractInstance.getGameCurrentRoundId(self.id, function(error, result) {
                    self.currentRoundId = result.valueOf();
                    done(error, result.valueOf());
                });
            },
            function(currentRoundId, done) {
                self.contractInstance.getGamePrize(self.id, function(error, result){
                    self.prize = web3.fromWei(result.valueOf(), 'ether');
                    done(error, result.valueOf());
                });
            },
            function(roundPrize, done) {
                self.contractInstance.getGameMinAmountByBet(self.id, function(error, result){
                    self.minAmount = web3.fromWei(result.valueOf(), 'ether');
                    done(error, self.minAmount);
                });
            },
            function(roundMinAmountByBet, done) {
                self.contractInstance.getGameMaxNumberOfBets(self.id, function(error, result){
                    self.maxNumber = result.valueOf();
                    done(error, result.valueOf());
                });
            },
            function rounds(maxNumberOfBets, done) {
                for (var j = 0; j <= self.currentRoundId; j++) {
                    self.rounds.push(new Round(self, j));
                    self.lotthereum.addRoundPlaceHolder(self.id, j);
                }
                done(null, self.currentRoundId);
            },
        ],
        function (err) {
            if (err) {
                console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.error(err);
            }
        });
    }

    this.init();
    console.log('game.id >>>> ' + this.id);
}

function Round(game, roundId) {
    this.id = roundId;
    this.game = game;
    this.gameId = game.id;
    this.lotthereum = game.lotthereum;
    this.contractInstance = game.lotthereum.contractInstance;
    this.initialized = false;
    this.rendered = 0;
    this.tabbed = 0;
    var self = this;

    this.init = function (payload) {
        self.payload = payload;
        self.open = false;
        self.remaining = 0;
        self.progress = 0;
        self.number = -1;
        self.bets = [];

        async.waterfall([
            function(done) {
                self.contractInstance.getGameRoundOpen(self.game.id, self.id, function(error, result){
                    self.open = result.valueOf();
                    done(error, result.valueOf());
                });
            },
            function(isOpen, done) {
                self.contractInstance.getRoundNumber(self.game.id, self.id, function(error, result){
                    self.number = result.valueOf();
                    done(error, self.number);
                });
            },
            function(number, done) {
                self.contractInstance.getRoundNumberOfBets(self.game.id, self.id, function(error, result){
                    self.numberOfBets = result.valueOf();
                    console.log('self.game.maxNumber: '+ self.game.maxNumber)
                    self.remaining = parseInt(self.game.maxNumber) - parseInt(self.numberOfBets);
                    self.progress = parseFloat(100 * self.numberOfBets / self.game.maxNumber).toString();
                    for (var i = self.numberOfBets - 1; i >= 0; i--) {
                        self.bets.push(new Bet(self, i));
                    }
                    if (self.numberOfBets < 1) {
                        self.initialized = true;
                        self.lotthereum.isInitialized(self.gameId, self.id);
                    }
                    done(error, result.valueOf());
                });
            },
        ],
        function (err) {
            if (err) {
                console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.error(err);
            }
        });
    }
    this.init();
}

function Bet(round, betId) {
    this.id = betId;
    this.roundId = round.id;
    this.round = round;
    this.contractInstance = round.contractInstance;
    this.lotthereum = round.lotthereum;
    this.origin = '';
    this.amount = 0;
    this.bet = '';
    this.transactionId = '';
    this.confirmations = 0;
    this.initialized = false;
    var self = this;

    this.init = function () {
        async.waterfall([
            function(done) {
                self.contractInstance.getRoundBetOrigin(self.round.game.id, self.round.id, self.id, function(error, result){
                    self.origin = result.valueOf();
                    done(error, self.origin);
                });
            },
            function(roundBetOrigin, done) {
                self.contractInstance.getRoundBetAmount(self.round.game.id, self.round.id, self.id, function(error, result){
                    self.amount = web3.fromWei(result.valueOf(), 'ether');
                    done(error, self.amount);
                });
            },
            function(amount, done) {
                self.contractInstance.getRoundBetNumber(self.round.game.id, self.round.id, self.id, function(error, result){
                    self.bet = result.valueOf();
                    done(error, self.bet);
                });
            },
            function(bet, done) {
                self.initialized = true;
                done(null, 'done!');
            }
        ],
        function (err) {
            if(err) {
                console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.error(err);
            } else {
                self.round.game.lotthereum.isInitialized(self.round.game.id, self.round.id);
            }
        });
    }
    this.init();
}