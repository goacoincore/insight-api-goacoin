'use strict';

var request = require('request');

function CurrencyController(options) {
  this.node = options.node;
  var refresh = options.currencyRefresh || CurrencyController.DEFAULT_CURRENCY_DELAY;
  this.currencyDelay = refresh * 60000;
  this.exchange_rates = {
    goa_usd: 0.00,
    btc_usd: 0.00,
    btc_goa: 0.00
  };
  this.timestamp = Date.now();
}

CurrencyController.DEFAULT_CURRENCY_DELAY = 10;

CurrencyController.prototype.index = function(req, res) {
  var self = this;
  var currentTime = Date.now();
  if (self.exchange_rates.goa_usd === 0.00 || currentTime >= (self.timestamp + self.currencyDelay)) {
    self.timestamp = currentTime;
    request('https://api.coinmarketcap.com/v1/ticker/goacoin', function(err, response, body) {
      if (err) {
        self.node.log.error(err);
      }
      if (!err && response.statusCode === 200) {
        var data = JSON.parse(body);
		
		self.exchange_rates.btc_goa = data[0].price_btc;
		self.exchange_rates.goa_usd = data[0].price_usd;
		self.exchange_rates.btc_usd = (data[0].price_usd / data[0].price_btc);
		self.exchange_rates.bitstamp = self.exchange_rates.goa_usd; // backwards compatibility
		
      }
      res.jsonp({
        status: 200,
        data: self.exchange_rates
      });
    });
  } else {
    res.jsonp({
      status: 200,
      data: self.exchange_rates
    });
  }

};

module.exports = CurrencyController;
