function render2(obj) {
    console.log(obj.innerHTML);
    obj.style.backgroundImage = 'url(' + blockies.create({ seed:obj.innerHTML, size: 8, scale: 16}).toDataURL()+')'
}

// render all identicons
function renderAllIdenticons2() {
    $('.eth-address2').each(function(i, obj) {
        render2(obj)
    });
}

function Lotthereum() {
    console.log('\'Allo \'Allo!');

    var lotthereum = null;
    var lotthereum_events = null;
    var account = null;

    // render identicons
    function render(obj) {
        obj.style.backgroundImage = 'url(' + blockies.create({ seed:obj.innerHTML, size: 8, scale: 16}).toDataURL()+')'
    }

    // render all identicons
    function renderAllIdenticons() {
        $('.eth-address').each(function(i, obj) {
            render(obj)
        });
    }

    // render round bet
    function renderRoundBet(rid, bid) {
        lotthereum.getRoundBetOrigin(rid, bid, function(error, result) {
            var origin = result.valueOf();
            var html = $('#bet_' + bid).html();
            html = html.replace('{origin}', origin);
            html = html.replace('{origin}', origin);
            $('#bet_' + bid).html(html);
            $('#bet_' + bid + ' .eth-address').css('background-image', 'url(' + blockies.create({ seed:origin, size: 8, scale: 16}).toDataURL())
        });
        lotthereum.getRoundBetAmount(rid, bid, function(error, result) {
            var amount = web3.fromWei(result.valueOf(), 'ether');
            var html = $('#bet_' + bid).html();
            $('#bet_' + bid).html(html.replace('{amount}', amount));
        });
        lotthereum.getRoundBetNumber(rid, bid, function(error, result) {
            var bet = result.valueOf();
            var html = $('#bet_' + bid).html();
            $('#bet_' + bid).html(html.replace('{bet}', bet));
        });

        // $('#round_' + rid).html(html);

        // return template;
    }

    // render round
    function renderRound(id) {
        var template = $('#round_template').html();
        template = template.replace('{round_id}', id);
        template = template.replace('{round_id}', id);
        template = template.replace('{round_id}', id);

        $('#rounds').append(template);

        lotthereum.getRoundOpen(id, function(error, result){
            var html = $('#round_' + id).html();
            if (result.valueOf() == true) {
                html = html.replace('>lock<', '>lock_open<')
                $('#round_' + id).addClass('blue')
            } else {
                $('#round_' + id).addClass('grey lighten-1')
            }
            $('#round_' + id).html(html);

            // if (result.valueOf() == true) {
            //     var html = $('#round_' + id).html();
            //     html.replace('>lock<', '>lock_open<')
            //     $('#round_' + id).html(html);
            // }
        });

        lotthereum.getRoundPrize(id, function(error, result){
            var html = $('#round_' + id).html();
            $('#round_' + id).html(html.replace('{prize}', web3.fromWei(result.valueOf(), 'ether')));
        });

        lotthereum.getRoundMinAmountByBet(id, function(error, result){
            var html = $('#round_' + id).html();
            $('#round_' + id).html(html.replace('{minAmount}', web3.fromWei(result.valueOf(), 'ether')));
        });

        lotthereum.getRoundMaxNumberOfBets(id, function(error, result){
            var html = $('#round_' + id).html();
            var maxNumberOfBets = result.valueOf();

            lotthereum.getRoundNumberOfBets(id, function(error, result){
                var html = $('#round_' + id).html();
                var numberOfBets = result.valueOf();
                var remaining = parseInt(maxNumberOfBets) - parseInt(numberOfBets);
                var progress = parseFloat(100 * numberOfBets / maxNumberOfBets);
                html = html.replace('{numberOfBets}', numberOfBets)
                html = html.replace('{remaining}', remaining)
                html = html.replace('{progress}', progress)
                $('#round_' + id).html(html);

                for (var i=numberOfBets-1; i>=0; i--) {
                    var bet_template = $('#bet_template').html();
                    bet_template = bet_template.replace('{bet_id}', i);
                    var html = $('#round_' + id).html();
                    $('#round_' + id + '_bets').append(bet_template);
                    // console.log($('#round_' + id + '_bets').html());
                    renderRoundBet(id, i);
                }
                // renderAllIdenticons2();
                // html = html.replace('{bets}', betsHtml);
                // $('#round_' + id).html(html);

            });
        });

        renderAllIdenticons();
    }

    // render rounds
    function renderRounds() {
        lotthereum.getCurrentRoundId(function(error, result) {
            var html = '';
            var current = result.valueOf();
            for (var i=current; i>=0; i--) {
                console.log('render: ' + i)
                renderRound(i);
            }
        });

        renderAllIdenticons2();

        // console.log(html)
    }

    // get account balance
    function getBalance(account) {
        web3.eth.getBalance(account, function(error, result) {
            if (!error){
                return result;
            } else {
                console.error(error);
            }
        });
    }

    // get accounts
    function getAccounts() {
        web3.eth.getAccounts(function(error, accounts) {
            accounts.forEach(function(_account) {
                if (account == null) {
                    account = _account;
                }
                $('#accounts_dropdown').append(
                    '<option value="' + _account + '">' + _account + '</option>'
                ); 
            });
            $('select').material_select();

            $('#accounts_dropdown').change(function() {
                account = $(this).val();
            });
        });
    }

    // modal init
    $('.modal').modal();

    // pushpin init
    $('.target').pushpin({
      top: 0,
      bottom: 1000,
      offset: 0
    });

    // accounts dropdown
    getAccounts();
    renderAllIdenticons();

    // place bet
    $('#bet-btn').click(function() {
        lotthereum.bet(3, {from: account, value: 100000000000000000, gas: 3000000}, function(error, result) {
            // $('#bet1').modal('close');
            $('#bet-btn').addClass('disabled');
            $('#confirmations').show();
            Materialize.fadeInImage('#confirmations');
            console.log('>>>>' + result);
        });
    });

    // Contract
    var LotthereumContract = web3.eth.contract([{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getRoundMinAmountByBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_a","type":"bytes32"}],"name":"getNumber","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"roundId","type":"uint256"},{"name":"betId","type":"uint256"}],"name":"getRoundBetNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getRoundPrize","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getRoundMaxNumberOfBets","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCurrentRoundId","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getRoundOpen","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getRoundNumber","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getBlockPointer","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"roundId","type":"uint256"},{"name":"betId","type":"uint256"}],"name":"getRoundBetAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getRoundBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getRoundNumberOfBets","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"roundId","type":"uint256"},{"name":"betId","type":"uint256"}],"name":"getRoundBetOrigin","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"bet","type":"uint8"}],"name":"bet","outputs":[{"name":"","type":"bool"}],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"i","type":"uint256"}],"name":"getBlockHash","outputs":[{"name":"blockHash","type":"bytes32"}],"payable":false,"type":"function"},{"inputs":[{"name":"_blockPointer","type":"uint256"},{"name":"_maxNumberOfBets","type":"uint256"},{"name":"_minAmountByBet","type":"uint256"},{"name":"_prize","type":"uint256"},{"name":"_hash","type":"bytes32"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"id","type":"uint256"},{"indexed":false,"name":"maxNumberOfBets","type":"uint256"},{"indexed":false,"name":"minAmountByBet","type":"uint256"}],"name":"RoundOpen","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"id","type":"uint256"},{"indexed":false,"name":"number","type":"uint8"},{"indexed":false,"name":"blockNumber","type":"uint256"},{"indexed":false,"name":"blockHash","type":"bytes32"}],"name":"RoundClose","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"maxNumberOfBets","type":"uint256"}],"name":"MaxNumberOfBetsChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"minAmountByBet","type":"uint256"}],"name":"MinAmountByBetChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"origin","type":"address"}],"name":"BetPlaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"winnerAddress","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"RoundWinner","type":"event"}]);

    // instantiate by address
    lotthereum = LotthereumContract.at('0x41feda9f274aabea9c4b94feea605c03f010ce6f');
    window.lotthereum = lotthereum;

    // event RoundOpen(uint id, uint maxNumberOfBets, uint minAmountByBet);
    // event RoundClose(uint id, uint8 luckyNumber, uint blockNumber, bytes32 blockHash);
    // event MaxNumberOfBetsChanged(uint maxNumberOfBets);
    // event MinAmountByBetChanged(uint minAmountByBet);
    // event BetPlaced(address origin);
    // event RoundWinner(address winnerAddress, uint amount);

    var betPlacedEvent = lotthereum.BetPlaced();
    betPlacedEvent.watch(function(error, event){
        if (!error && event) {
            if (event.args.origin == account) {
                $('#bet1').modal('close');
                $('#bet-btn').removeClass('disabled');
                $('#confirmations').hide();
                $('.collection').first().prepend('<li class="collection-item avatar"><div class="eth-address">' + account + '</div><span class="title flow-text">' + account + '</span><p class="secondary-content title">0.1 ether</p><span class="confirmation-badge new badge blue lighten-2" data-badge-caption="confirmations">0</span></li>');
                renderAllIdenticons();
                // web3.eth.blockNumber - web3.eth.getTransaction('0x7683...').blockNumber
            }
            Materialize.toast('New bet placed', 3000, 'rounded')
        }
    });


    renderRounds();


    // var events = lotthereum.allEvents();
    // events.watch(function(error, event){
    //     if (error) {
    //         console.log("Error: " + error);
    //     } else {
    //         Materialize.toast(event.event + ': ', 3000, 'rounded')
    //         console.log(event.event + ": " + JSON.stringify(event.args));
    //     }
    // });

    // var filter = web3.eth.filter('latest');
    // filter.watch(function(error, result) {
    //   var block = web3.eth.getBlock(result, true);
    //   console.log('block #' + block.number);
    //   console.dir(block.transactions);
    // }

    // var event = lotthereum.BetPlaced(function(error, result){
    //   if (!error)
    //     console.log(result);
    // });

    // var event = lotthereum.allEvents({fromBlock: 0, toBlock: 'latest'}, function(error, result){
    //   if (!error)
    //     console.log(result);
    // });

    // var filter = web3.eth.filter({fromBlock:0, toBlock: 'latest', address: '0x681737ff5cb4E1ecE08fC3a53442C65aCd9c3e55', 'topics':[web3.sha3('newtest(address)')]});
    // filter.watch(function(error, result) {
    //    console.log("RESULT: Filter " + i++ + ": " + JSON.stringify(result));
    // })

    // var filter = web3.eth.filter({ address: ['0x681737ff5cb4E1ecE08fC3a53442C65aCd9c3e55'], fromBlock: 0, toBlock: "latest" });
    // var i = 0;
    // filter.watch(function (error, result) {
    //   console.log("RESULT: Filter " + i++ + ": " + JSON.stringify(result));
    // });
    // filter.stopWatching();
}
