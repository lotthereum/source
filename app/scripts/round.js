function Game(lotthereum, contractInstance, id) {
    this.contractInstance = contractInstance;
    this.lotthereum = lotthereum;
    this.id = id;
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

    var self = this;

    this.init = function () {
        async.waterfall([
            function currentRound(done) {
                self.contractInstance.getGameCurrentRoundId(self.id, function(error, result) {
                    self.currentRoundId = result.valueOf();
                    done(error, result.valueOf());
                });
            },
            function rounds(currentRoundId, done) {
                for (var j = 0; j <= currentRoundId; j++) {
                    self.rounds.push(new Round(self.lotthereum, self.contractInstance, self.id, j));
                    self.lotthereum.addRoundPlaceHolder(self.id, j);
                }
                done(null, currentRoundId);
            },
            function(roundNumber, done) {
                self.contractInstance.getGamePrize(self.id, function(error, result){
                    self.prize = web3.fromWei(result.valueOf(), 'ether');
                    done(error, result.valueOf());
                });
            },
            function(roundPrize, done) {
                self.contractInstance.getGameMinAmountByBet(self.id, function(error, result){
                    self.minAmount = web3.fromWei(result.valueOf(), 'ether');
                    if (self.tabbed == 0) {
                        $('#tabs').append('<li class="tab col s2"><a href="#game_' + self.id + '_holder">' + self.minAmountByBet +'</a></li>');
                        self.tabbed++;
                    }

                    done(error, self.minAmount);
                });
            },
            function(roundMinAmountByBet, done) {
                self.contractInstance.getGameMaxNumberOfBets(self.id, function(error, result){
                    self.maxNumber = result.valueOf();
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
    console.log('game.id >>>> ' + this.id);
}

function Round(lotthereum, contractInstance, gameId, roundId) {
    this.contractInstance = contractInstance;
    this.lotthereum = lotthereum;
    this.id = roundId;
    this.gameId = gameId;
    this.game = this.lotthereum.games[gameId];
    this.initialized = false;
    this.rendered = 0;

    var self = this;

    this.init = function () {
        self.open = false;
        self.minAmount = 0;
        self.maxNumber = 0;
        self.numberOfBets = 0;
        self.prize = 0;
        self.remaining = 0;
        self.progress = 0;
        self.number = -1;
        self.bets = [];

        async.waterfall([
            function(done) {
                self.contractInstance.getGameRoundOpen(self.gameId, self.id, function(error, result){
                    self.open = result.valueOf();
                    done(error, result.valueOf());
                });
            },
            function(isOpen, done) {
                self.contractInstance.getRoundNumber(self.gameId, self.id, function(error, result){
                    self.number = result.valueOf();
                    done(error, self.number);
                });
            },
            function(number, done) {
                self.contractInstance.getRoundNumberOfBets(self.gameId, self.id, function(error, result){
                    self.numberOfBets = result.valueOf();
                    self.remaining = parseInt(self.maxNumber) - parseInt(self.numberOfBets);
                    self.progress = parseFloat(100 * self.numberOfBets / self.maxNumber).toString();
                    for (var i = self.numberOfBets - 1; i >= 0; i--) {
                        self.bets.push(new Bet(self, i));
                    }
                    if (self.numberOfBets < 1) {
                        self.initialized = true;
                        self.lotthereum.renderRoundIfInitialized(self.gameId, self.id);
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
    this.round = round;
    this.contractInstance = round.contractInstance;
    this.lotthereum = round.game;
    this.roundId = round.id;
    this.id = betId;
    this.origin = '';
    this.amount = 0;
    this.bet = '';
    this.transactionId = '';
    this.confirmations = 0;
    this.initialized = false;

    var self = this;
    async.waterfall([
        function(done) {
            self.contractInstance.getRoundBetOrigin(self.roundId, self.id, function(error, result){
                self.origin = result.valueOf();
                done(error, self.origin);
            });
        },
        function(roundBetOrigin, done) {
            self.contractInstance.getRoundBetAmount(self.roundId, self.id, function(error, result){
                self.amount = web3.fromWei(result.valueOf(), 'ether');
                done(error, self.amount);
            });
        },
        function(amount, done) {
            self.contractInstance.getRoundBetNumber(self.roundId, self.id, function(error, result){
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
            self.game.renderRoundIfInitialized(self.roundId);
        }
    });
}

function Lotthereum() {
    this.contract = web3.eth.contract([{'constant':false,'inputs':[{'name':'gameId','type':'uint256'},{'name':'bet','type':'uint8'}],'name':'placeBet','outputs':[{'name':'','type':'bool'}],'payable':true,'type':'function'},{'constant':true,'inputs':[],'name':'getBalance','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'_a','type':'bytes32'}],'name':'getNumber','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':false,'inputs':[],'name':'withdraw','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':false,'inputs':[],'name':'kill','outputs':[],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'}],'name':'getGameRoundOpen','outputs':[{'name':'','type':'bool'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'}],'name':'getRoundPointer','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getGameMinAmountByBet','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'}],'name':'getRoundNumberOfBets','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetOrigin','outputs':[{'name':'','type':'address'}],'payable':false,'type':'function'},{'constant':false,'inputs':[{'name':'pointer','type':'uint256'},{'name':'maxNumberOfBets','type':'uint256'},{'name':'minAmountByBet','type':'uint256'},{'name':'prize','type':'uint256'}],'name':'createGame','outputs':[{'name':'id','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[],'name':'getGames','outputs':[{'name':'ids','type':'uint256[]'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'}],'name':'getRoundNumber','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getGameCurrentRoundId','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetNumber','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getGameMaxNumberOfBets','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getPointer','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'}],'name':'getGamePrize','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'i','type':'uint256'}],'name':'getBlockHash','outputs':[{'name':'blockHash','type':'bytes32'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'gameId','type':'uint256'},{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetAmount','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'payable':true,'type':'fallback'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':true,'name':'roundId','type':'uint256'}],'name':'RoundOpen','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':true,'name':'roundId','type':'uint256'},{'indexed':false,'name':'number','type':'uint8'}],'name':'RoundClose','type':'event'},{'anonymous':false,'inputs':[{'indexed':false,'name':'maxNumberOfBets','type':'uint256'}],'name':'MaxNumberOfBetsChanged','type':'event'},{'anonymous':false,'inputs':[{'indexed':false,'name':'minAmountByBet','type':'uint256'}],'name':'MinAmountByBetChanged','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':true,'name':'roundId','type':'uint256'},{'indexed':true,'name':'origin','type':'address'},{'indexed':false,'name':'betId','type':'uint256'}],'name':'BetPlaced','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'gameId','type':'uint256'},{'indexed':true,'name':'roundId','type':'uint256'},{'indexed':true,'name':'winnerAddress','type':'address'},{'indexed':false,'name':'amount','type':'uint256'}],'name':'RoundWinner','type':'event'}]);

    this.contractInstance = this.contract.at(window.contract_address);
    this.modalIntro = 0;
    var self = this;

    this.init = function () {
        self.games = [];
        $('#tabs').html('');
        $('#games-container').html('');

        async.waterfall([
            function games(done) {
                self.contractInstance.getGames(function(error, result) {
                    console.log('result.valueOf(): ' + result.valueOf())
                    var games = result.valueOf();
                    for (var i = 0; i < games.length; i++) {
                        self.games.push(new Game(self, self.contractInstance, i));
                        self.addGamePlaceHolder(i);
                    }
                    $('#tabs').tabs({'swipeable': false});
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

    this.initEvents = function () {
        self.betPlacedEvent = self.contractInstance.BetPlaced();
        self.betPlacedEvent.watch(self.betPlaced);

        self.roundCloseEvent = self.contractInstance.RoundClose();
        self.roundCloseEvent.watch(self.roundClose);

        self.roundOpenEvent = self.contractInstance.RoundOpen();
        self.roundOpenEvent.watch(self.roundOpen);

        self.roundWinnerEvent = self.contractInstance.RoundWinner();
        self.roundWinnerEvent.watch(self.roundWinner);
    }

    this.roundClose = function (error, event) {
        console.log('round closed: ' + event.args.id);
        Materialize.toast('Round #' + event.args.id + ' closed!', 5000, 'rounded');
    }

    this.roundOpen = function (error, event) {
        console.log('round opened: ' + event.args.id);
        Materialize.toast('Round #' + event.args.id + ' opened!', 5000, 'rounded');
        self.init();
    }

    // this.betPlacedDispatched = false;
    this.betPlaced = function (error, event) {
        // if (self.betPlacedDispatched) {
            console.log('betPlaced event origin: ' + event.args.origin);
            if (event.args.origin == self.account) {
                $('#bet1').modal('close');
                $('#bet-btn').removeClass('disabled');
                $('#confirmations').css('opacity', 0);
            }
            Materialize.toast('New bet placed', 5000, 'rounded');
            self.rounds[event.args.roundId].init();
        // }
        // console.log('betPlacedDispatched');
        // self.betPlacedDispatched = true;
        // $('#bet-btn').removeClass('disabled');
        // $('#confirmations').css('opacity', 0);
    }

    this.roundWinner = function (error, event) {
        console.log('round winner: ' + event.args.winnerAddress + ' ' + web3.fromWei(event.args.amount, 'ether') + ' ETH');
        Materialize.toast('Round winner ' + event.args.winnerAddress, 5000, 'rounded');
    }

    this.renderRoundIfInitialized = function (gameId, roundId) {
        // self.rounds[id].initialized = true;
        // self.renderRound(id);
        self.games[gameId].rounds[roundId].rendered++;
        if (self.games[gameId].rounds[roundId].rendered >= self.games[gameId].rounds[roundId].numberOfBets) {
            self.games[gameId].rounds[roundId].initialized = true;
            self.renderRound(gameId, roundId);
            self.games[gameId].rounds[roundId].rendered = 0;
        }
    }

    this.renderRound = function (gameId, roundId) {
        var game = self.games[gameId];
        var round = self.games[gameId].rounds[roundId];

        console.log('redering round #' + roundId);
        $('#rounds_' + gameId + ' #round_' + roundId + '_holder').html('');

        var html = $('#round_template').html();
        html = html.replace(/{round_id}/g, roundId);
        if (round.open) {
            html = html.replace('>lock<', '>lock_open<');
            html = html.replace('{color}', 'blue');
            html = html.replace('{betButton}', $('#bet_button_template').html());
        } else {
            html = html.replace('{color}', 'grey lighten-1');
        }
        html = html.replace(/{prize}/g, round.prize);
        html = html.replace('{minAmount}', round.minAmount);
        html = html.replace('{minAmount}', round.minAmount);
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

        // self.rounds[id].initialized = true;

        if (self.areAllRoundsInitialed()) {
            console.log('INITIALIZED!!!!');
            self.stopLoading();
        }
    }

    this.stopLoading = function () {
        self.renderAllIdenticons();
        $('#loading').hide();
        $('.page-footer').css('display', 'block');
        $('.main-container').css('display', 'block');
        // $('#avatar').css('display', 'block');
        $('.navbar-fixed').css('display', 'block');
        $('.nav-wrapper').css('background', '#2196F3');
        
        // $('ul.tabs').tabs('select_tab', 'bet001');

        // if (self.modalIntro <= 0) {
        //     this.modalIntro++;
        //     $('#intro').modal('open');
        // }

        // for (var i = 0; i <= self.currentRoundId; i++) {
        //     self.rounds[i].initialized = false;
        // }
    }

    this.startLoading = function () {
        $('#loading').show();
        $('.page-footer').css('display', 'none');
        $('.main-container').css('display', 'none');
        // $('#avatar').css('display', 'none');
        $('.navbar-fixed').css('display', 'none');
        $('.nav-wrapper').css('background', 'white');

        // $('ul.tabs').tabs('select_tab', 'bet001');
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

    this.renderIdenticon = function (obj) {
        obj.style.backgroundImage = 'url(' + blockies.create({ seed:obj.innerHTML.toLowerCase(), size: 8, scale: 16}).toDataURL() + ')'
    }

    this.renderAllIdenticons = function () {
        $('.eth-address').each(function(i, obj) {
            self.renderIdenticon(obj)
        });
    }

    this.renderAvatar = function (address) {
        $('#avatar').html(address);
        // $('#avatar').attr('data-tooltip', address);
        // $('.tooltipped').tooltip({delay: 60});
        $('#avatar').each(function(i, obj) {
            self.renderIdenticon(obj)
        });
        // $('#avatar').css('display', 'block');
    }

    this.changeAccount = function (address) {
        self.account = address;
        self.renderAvatar(self.account);
        self.contractInstance.getBalance({from: self.account}, function(error, result){
            var balance = web3.fromWei(result.valueOf(), 'ether');
            $('#current_account_balance').html(balance + ' ETH');
        });
        $('#current_account_number').html(self.account);
    }

    this.initAccounts = function () {
        self.accounts = [];
        self.account = null;

        web3.eth.getAccounts(function(error, accounts) {
            var account = null;
            accounts.forEach(function(_account) {
                if (account == null) {
                    account = _account;
                }
                // $('#accounts_dropdown').append('<option value="' + _account + '">' + _account + '</option>');
                $('#dropdown-nav').append('<li class="valign-wrapper"><a href="#!' + _account + '" class="accounts_dropdown_item"><div class="eth-address square">' + _account + '</div> ' + _account + '</a></li>');
            });

            if (account != null) {
                self.changeAccount(account)
                $('#avatar').css('display', 'block');
            } else {
                console.log('No accounts found!');
                $('#alert1').modal('open');
            }

            // $('#accounts_dropdown').on('change', function () {
            //     self.account = $(this).val();
            //     self.renderAvatar(self.account);
            // });

            $('select').material_select();

            $('.accounts_dropdown_item').click(function() {
                var newValue = $(this).attr('href').replace('#!', '');
                console.log(newValue);
                self.changeAccount(newValue)
            });
        });
    }

    this.placeBet = function (bet) {
        var value = self.rounds[self.currentRoundId].minAmount * 1000000000000000000
        var gas = 500000;
        console.log('sending from: ' + self.account)

        self.contractInstance.bet(bet, {from: self.account, value: value, gas: gas}, function(error, result) {
            $('#bet-btn').addClass('disabled');
            // $('#confirmations').css('opacity', 1);
            Materialize.fadeInImage('#confirmations');
            console.log(result);
        });
    }

    this.withdraw = function () {
        var gas = 500000;
        console.log('withdraw from: ' + self.account)
        self.contractInstance.withdraw({from: self.account, gas: gas}, function(error, result) {
            $('#withdraw-btn').addClass('disabled');
            $('#withdraw-transaction-id').html(result)
            Materialize.fadeInImage('#withdraw-confirmations');
        });
    }

    this.initUIElements = function () {
        $('.modal').modal();
        $('.target').pushpin({top: 0, bottom: 1000, offset: 0});
        $('.tooltipped').tooltip({delay: 60});

        $('#bet-btn').click(function() {
            var bet = parseInt($('input[name=bet_pick]:checked').val());
            if (bet <= 9 && bet >= 0) {
                self.placeBet($('input[name=bet_pick]:checked').val());
            }
        });

        $('#withdraw-btn').click(function() {
            self.withdraw();
        });

        $('#close-intro-btn').click(function() {
            $('#intro').css('display', 'none');
        });

        $(window).scroll(function() {
            var opacity = 1 - $(window).scrollTop() / 70;
            if (opacity < 0) {
                opacity = 0;
            }
            $('.tabs').css('opacity', opacity);
        });
    }

    this.init();
    this.initEvents();
    this.initAccounts();
    this.initUIElements();
}

$(document).ready(function() {
    $('.modal').modal();

    $('.tooltipped').tooltip({delay: 60});
    $('#close-intro-btn').click(function() {
        $('#intro').css('display', 'none');
    });
    $(window).scroll(function() {
        var opacity = 1 - $(window).scrollTop() / 70;
        if (opacity < 0) {
            opacity = 0;
        }
        $('.tabs').css('opacity', opacity);
    });
    $('#logo-btn').click(function() {
        $('ul.tabs').tabs('select_tab', 'intro1');
    });
    $('.main-container').css('display', 'block');
    $('#place-your-bet').click(function() {
        $('ul.tabs').tabs('select_tab', 'bet001');
    });
});
