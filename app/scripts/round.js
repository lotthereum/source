function Round(game, contractInstance, id) {
    this.contractInstance = contractInstance;
    this.game = game;
    this.id = id;
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
                self.contractInstance.getRoundOpen(self.id, function(error, result){
                    self.open = result.valueOf();
                    done(error, result.valueOf());
                });
            },
            function(isOpen, done) {
                self.contractInstance.getRoundNumber(self.id, function(error, result){
                    self.number = result.valueOf();
                    done(error, self.number);
                })
            },
            function(roundNumber, done) {
                self.contractInstance.getRoundPrize(self.id, function(error, result){
                    self.prize = web3.fromWei(result.valueOf(), 'ether');
                    done(error, result.valueOf());
                });
            },
            function(roundPrize, done) {
                self.contractInstance.getRoundMinAmountByBet(self.id, function(error, result){
                    self.minAmount = web3.fromWei(result.valueOf(), 'ether');
                    done(error, result.valueOf());
                });
            },
            function(roundMinAmountByBet, done) {
                self.contractInstance.getRoundMaxNumberOfBets(self.id, function(error, result){
                    self.maxNumber = result.valueOf();
                    done(error, result.valueOf());
                })
            },
            function(roundMaxNumberOfBets, done) {
                self.contractInstance.getRoundNumberOfBets(self.id, function(error, result){
                    self.numberOfBets = result.valueOf();
                    done(error, result.valueOf());
                })
            },
            function(roundNumberOfBets, done) {
                self.remaining = parseInt(self.maxNumber) - parseInt(self.numberOfBets);
                self.progress = parseFloat(100 * self.numberOfBets / self.maxNumber);
                for (var i = self.numberOfBets - 1; i >= 0; i--) {
                    self.bets.push(new Bet(self, i));
                }
                if (self.numberOfBets < 1) {
                    self.initialized = true;
                    self.game.renderRoundIfInitialized(self.id);
                    // self.game.renderRound(self.id);
                }

                done(null, self.progress);
            }
        ],
        function (err) {
            if (err) {
                console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.error(err);
            }
        });
    }

    // this.areAllBetsInitialed = function () {
    //     var ret = true;
    //     for (var i = 0; i <= self.numberOfBets; i++) {
    //         if (self.bets[i].initialized == false) {
    //             ret = false;
    //         }
    //     }
    //     return ret
    // }

    this.init();
}

function Bet(round, betId) {
    this.round = round;
    this.contractInstance = round.contractInstance;
    this.game = round.game;
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

            // console.log('id: ' + self.roundId + ' | numberOfBets: ' + self.round.numberOfBets + ' | bets length: ' + self.round.bets.length)
            // if (self.round.numberOfBets == self.round.bets.length){
            //     self.round.initialized = true;
            //     self.game.renderRoundIfInitialized(self.roundId);
            // }

            // var d = true;
            // for (var i = 0; i <= self.round.numberOfBets; i++) {
            //     if (self.round.bets[i].initialized == false) {
            //         d = false;
            //     }
            // }
            // if (d) {
            //     self.game.rounds[self.roundId].initialized = true;
            //     self.game.renderRound(self.roundId);
            // }

            // self.game.renderRoundIfInitialized(self.roundId);

            // if ((!self.game.rounds[self.roundId].initialized) && (self.game.rounds[self.roundId].numberOfBets == self.game.rounds[self.roundId].bets.length)) {
            //     self.game.rounds[self.roundId].initialized = true;
            //     self.game.renderRound(self.roundId);
            // }

            // var d = true;
            // console.log(self.roundId + ': numberOfBets: ' + self.game.rounds[self.roundId].numberOfBets)
            // for (var i = 0; i <= self.game.rounds[self.roundId].numberOfBets; i++) {
            //     if (self.game.rounds[self.roundId].bets[i].initialized == false) {
            //         d = false;
            //     }
            // }
            // if (d){
            //     self.game.rounds[self.roundId].initialized = true;
            //     self.game.renderRound(self.roundId);
            // }

            // if (self.game.rounds[self.roundId].areAllBetsInitialed()) {
            //     self.game.rounds[self.roundId].initialized = true;
            //     self.game.renderRound(self.roundId);
            // }

            // if (self.game.rounds[self.roundId].bets.length - 1 == self.id) {
            //     self.game.rounds[self.roundId].initialized = true;
            //     self.game.renderRound(self.roundId);
            // }
        }
    });
}

function Game() {
    this.contract = web3.eth.contract([{'constant':true,'inputs':[{'name':'id','type':'uint256'}],'name':'getRoundMinAmountByBet','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[],'name':'getBalance','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'_a','type':'bytes32'}],'name':'getNumber','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetNumber','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'id','type':'uint256'}],'name':'getRoundPrize','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':false,'inputs':[],'name':'withdraw','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':false,'inputs':[],'name':'kill','outputs':[],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'id','type':'uint256'}],'name':'getRoundMaxNumberOfBets','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[],'name':'getCurrentRoundId','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'id','type':'uint256'}],'name':'getRoundOpen','outputs':[{'name':'','type':'bool'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'id','type':'uint256'}],'name':'getRoundNumber','outputs':[{'name':'','type':'uint8'}],'payable':false,'type':'function'},{'constant':true,'inputs':[],'name':'getBlockPointer','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetAmount','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'id','type':'uint256'}],'name':'getRoundBlockNumber','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'id','type':'uint256'}],'name':'getRoundNumberOfBets','outputs':[{'name':'','type':'uint256'}],'payable':false,'type':'function'},{'constant':true,'inputs':[{'name':'roundId','type':'uint256'},{'name':'betId','type':'uint256'}],'name':'getRoundBetOrigin','outputs':[{'name':'','type':'address'}],'payable':false,'type':'function'},{'constant':false,'inputs':[{'name':'bet','type':'uint8'}],'name':'bet','outputs':[{'name':'','type':'bool'}],'payable':true,'type':'function'},{'constant':true,'inputs':[{'name':'i','type':'uint256'}],'name':'getBlockHash','outputs':[{'name':'blockHash','type':'bytes32'}],'payable':false,'type':'function'},{'inputs':[{'name':'_blockPointer','type':'uint256'},{'name':'_maxNumberOfBets','type':'uint256'},{'name':'_minAmountByBet','type':'uint256'},{'name':'_prize','type':'uint256'},{'name':'_hash','type':'bytes32'}],'payable':false,'type':'constructor'},{'payable':true,'type':'fallback'},{'anonymous':false,'inputs':[{'indexed':true,'name':'id','type':'uint256'},{'indexed':false,'name':'maxNumberOfBets','type':'uint256'},{'indexed':false,'name':'minAmountByBet','type':'uint256'}],'name':'RoundOpen','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'id','type':'uint256'},{'indexed':false,'name':'number','type':'uint8'},{'indexed':false,'name':'blockNumber','type':'uint256'},{'indexed':false,'name':'blockHash','type':'bytes32'}],'name':'RoundClose','type':'event'},{'anonymous':false,'inputs':[{'indexed':false,'name':'maxNumberOfBets','type':'uint256'}],'name':'MaxNumberOfBetsChanged','type':'event'},{'anonymous':false,'inputs':[{'indexed':false,'name':'minAmountByBet','type':'uint256'}],'name':'MinAmountByBetChanged','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'origin','type':'address'},{'indexed':false,'name':'roundId','type':'uint256'},{'indexed':false,'name':'betId','type':'uint256'}],'name':'BetPlaced','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'winnerAddress','type':'address'},{'indexed':false,'name':'amount','type':'uint256'}],'name':'RoundWinner','type':'event'}]);

    this.contractInstance = this.contract.at('0x84b0d29f2c4abd8c1c8de5e10954bf0dcc01d83c');  // ropsten 
    // this.contractInstance = this.contract.at('0x1489bd836c3883ef265b1f5ca70bd8bec3246a39');

    var self = this;
    this.init = function () {
        this.startLoading();
        $('#rounds').html('');
        self.currentRoundId = -1
        self.rounds = [];
        self.accounts = [];
        self.account = null;

        async.waterfall([
            function firstStep(done) {
                self.contractInstance.getCurrentRoundId(function(error, result) {
                self.currentRoundId = result.valueOf();
                    done(null, self.currentRoundId);
                })
            },
            function secondStep(currentRoundId, done) {
                for (var i = 0; i <= currentRoundId; i++) {
                    self.addRoundPlaceHolder(i);
                    self.rounds.push(new Round(self, self.contractInstance, i));
                }
                done(null, i);
            }
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

    this.betPlacedDispatched = false;
    this.betPlaced = function (error, event) {
        if (self.betPlacedDispatched) {
            console.log('betPlaced event origin: ' + event.args.origin);
            if (event.args.origin == self.account) {
                $('#bet1').modal('close');
                $('#bet-btn').removeClass('disabled');
                $('#confirmations').css('opacity', 0);
            }
            Materialize.toast('New bet placed', 5000, 'rounded');
            self.rounds[event.args.roundId].init();
        }
        console.log('betPlacedDispatched');
        self.betPlacedDispatched = true;
    }

    this.renderRoundIfInitialized = function (id) {
        self.rounds[id].rendered++;
        if (self.rounds[id].rendered >= self.rounds[id].numberOfBets) {
            self.rounds[id].initialized = true;
            self.renderRound(id);
            self.rounds[id].rendered = 0;
        }
    }

    this.renderRound = function (id) {
        console.log('redering round #' + id);
        $('#round_' + id + '_holder').html('');

        // var html = $('#round_template div:first').html();
        var html = $('#round_template').html();
        html = html.replace(/{round_id}/g, id);
        if (self.rounds[id].open) {
            html = html.replace('>lock<', '>lock_open<');
            html = html.replace('{color}', 'blue');
            html = html.replace('{betButton}', $('#bet_button_template').html());
        } else {
            html = html.replace('{color}', 'grey lighten-1');
        }
        html = html.replace(/{prize}/g, self.rounds[id].prize);
        html = html.replace('{minAmount}', self.rounds[id].minAmount);
        html = html.replace('{minAmount}', self.rounds[id].minAmount);
        html = html.replace('{numberOfBets}', self.rounds[id].numberOfBets)
        html = html.replace('{remaining}', self.rounds[id].remaining)
        html = html.replace('{progress}', self.rounds[id].progress)

        // render bets
        var bets_html = ''
        var has_winner = false;
        for (var j = self.rounds[id].bets.length-1; j >= 0; j--) {
            var bet_html = $('#bet_template').html();

            if ((!self.rounds[id].open) && (self.rounds[id].bets[j].bet == self.rounds[id].number)) {
                bet_html = bet_html.replace(' {win}', ' green lighten-3');
                has_winner = true;
            } else {
                bet_html = bet_html.replace(' {win}', '');
            } 

            bet_html = bet_html.replace(/{bet_id}/g, self.rounds[id].bets[j].id);
            bet_html = bet_html.replace(/{origin}/g, self.rounds[id].bets[j].origin);
            bet_html = bet_html.replace(/{amount}/g, self.rounds[id].bets[j].amount);
            bets_html += bet_html;
        }
        html = html.replace('{bets}', bets_html);

        if (!self.rounds[id].open) {
            var btnHtml = $('#bet_number_template').html().replace(/{number}/g, self.rounds[id].number);
            if (has_winner) {
                btnHtml = btnHtml.replace('{color}', 'green');
                html = html.replace('{betButton}', btnHtml);
            } else {
                btnHtml = btnHtml.replace('{color}', 'red');
                html = html.replace('{betButton}', btnHtml);
            }
        }

        $('#round_' + id + '_holder').html(html);

        // self.rounds[id].initialized = true;

        if (self.areAllRoundsInitialed()) {
            console.log('INITIALIZED!!!!');
            self.stopLoading();
        }
    }

    this.stopLoading = function () {
        self.renderAllIdenticons();
        $('.tooltipped').tooltip({delay: 60});
        $('#loading').hide();
        $('.page-footer').css('display', 'block');
        $('.main-container').css('display', 'block');
        $('#avatar').css('display', 'block');
        $('.navbar-fixed').css('display', 'block');
        $('.nav-wrapper').css('background', '#2196F3');
        // for (var i = 0; i <= self.currentRoundId; i++) {
        //     self.rounds[i].initialized = false;
        // }
    }

    this.startLoading = function () {
        $('#loading').show();
        $('.page-footer').css('display', 'none');
        $('.main-container').css('display', 'none');
        $('#avatar').css('display', 'none');
        $('.navbar-fixed').css('display', 'none');
        $('.nav-wrapper').css('background', 'white');
        $('ul.tabs').tabs('select_tab', 'bet001');
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

    this.addRoundPlaceHolder = function (roundId) {
        var html = $('#round_placeholder_template').html();
        html = html.replace(/{round_id}/g, roundId);
        $('#rounds').prepend(html);
    }

    // this.renderRounds = function () {
    //     console.log('Total rounds: ' + this.rounds.length);
    //     $('#rounds').html('');
    //     for (var i = 0; i < this.rounds.length; i++) {
    //         var html = $('#round_template').html();
    //         html = html.replace(/{round_id}/g, i);
    //         if (this.rounds[i].open) {
    //             html = html.replace('>lock<', '>lock_open<');
    //             html = html.replace('{color}', 'blue');
    //             html = html.replace('{betButton}', $('#bet_button_template').html());
    //         } else {
    //             html = html.replace('{color}', 'grey lighten-1');
    //             html = html.replace('{betButton}', $('#bet_number_template').html().replace(/{number}/g, this.rounds[i].number));
    //         }
    //         html = html.replace(/{prize}/g, this.rounds[i].prize);
    //         html = html.replace('{minAmount}', this.rounds[i].minAmount);
    //         html = html.replace('{minAmount}', this.rounds[i].minAmount);
    //         html = html.replace('{numberOfBets}', this.rounds[i].numberOfBets)
    //         html = html.replace('{remaining}', this.rounds[i].remaining)
    //         html = html.replace('{progress}', this.rounds[i].progress)

    //         // render bets
    //         var bets_html = ''
    //         for (var j = this.rounds[i].bets.length-1; j >= 0; j--) {
    //             var bet_html = $('#bet_template').html();
    //             if ((!this.rounds[i].open) && (this.rounds[i].bets[j].bet == this.rounds[i].number)) {
    //                 bet_html = bet_html.replace('{win}', 'green lighten-3');
    //             } else {
    //                 bet_html = bet_html.replace('{win}', '');
    //             } 
    //             bet_html = bet_html.replace(/{bet_id}/g, this.rounds[i].bets[j].id);
    //             bet_html = bet_html.replace(/{origin}/g, this.rounds[i].bets[j].origin);
    //             bet_html = bet_html.replace(/{amount}/g, this.rounds[i].bets[j].amount);
    //             bets_html += bet_html;
    //         }
    //         html = html.replace('{bets}', bets_html);

    //         $('#rounds').prepend(html);
    //     }

    //     this.renderAllIdenticons();
    //     $('.page-footer').css('display', 'block');
    //     $('.main-container').css('display', 'block');
    //     $('#loading').hide();
    // }

    this.renderIdenticon = function (obj) {
        obj.style.backgroundImage = 'url(' + blockies.create({ seed:obj.innerHTML, size: 8, scale: 8}).toDataURL() + ')'
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
            $('#current_account_balance').html(balance);
        });
        $('#current_account_number').html(self.account);
    }

    this.initAccounts = function () {
        web3.eth.getAccounts(function(error, accounts) {
            var account = null;
            accounts.forEach(function(_account) {
                if (account == null) {
                    account = _account;
                }
                // $('#accounts_dropdown').append('<option value="' + _account + '">' + _account + '</option>');
                $('#dropdown-nav').append('<li class="valign-wrapper"><a href="#!' + _account + '" class="accounts_dropdown_item"><div class="eth-address square">' + _account + '</div> ' + _account + '</a></li>');
            });

            if (self.account == null) {
                self.changeAccount(account)
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

    this.initUIElements = function () {
        $('.modal').modal();
        $('.target').pushpin({top: 0, bottom: 1000, offset: 0});
        $('#tabs').tabs({'swipeable': false});
        $('.tooltipped').tooltip({delay: 60});

        $('#bet-btn').click(function() {
            var bet = parseInt($('input[name=bet_pick]:checked').val());
            if (bet <= 9 && bet >= 0) {
                self.placeBet($('input[name=bet_pick]:checked').val());
            }
        });

        // $('#accounts_dropdown').change(function() {
        //     console.log($(this).val());
        //     self.account = $(this).val();
        //     $('#current_account_number').html(self.account);
        //     $('#avatar').html(self.account);
        //     // $('#avatar').attr('data-tooltip', self.account);
        //     $('#avatar').each(function(i, obj) {
        //         self.renderIdenticon(obj)
        //     });
        // });

        // $('#dropdown-nav').dropdown({
        //     hover: true,
        //     belowOrigin: true,
        //     alignment: 'center',
        // });

        $(window).scroll(function() {
            var opacity = 1 - $(window).scrollTop() / 70;
            if (opacity < 0) {
                opacity = 0;
            }
            $('#avatar, .tabs, #dropdown-nav').css('opacity', opacity);
        });
        $('ul.tabs').tabs('select_tab', 'bet001');
    }

    this.init();
    this.initEvents();
    this.initAccounts();
    this.initUIElements();
}
