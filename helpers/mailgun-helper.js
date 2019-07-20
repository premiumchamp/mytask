var mailgun;

var MailgunHelper = function (options) {
  this.apiKey = options.apiKey;
  this.domain = options.domain;
  this.fromAddress = options.fromAddress;
  this.toAddress = options.toAddress;
  mailgun = require('mailgun-js')({apiKey: this.apiKey, domain: this.domain});
}

MailgunHelper.prototype.send = function (data, callback) {

  var data = {
    from: data.from || this.fromAddress,
    to: data.to || this.toAddress,
    body: data.text,
    html: data.html,
    subject: data.subject
  }

  mailgun.messages().send(data, function (error, body) {

    if (error && callback) {
      callback(error, null);
    }
    else if (body && callback) {
      callback(null, body);
    }
  });
};

module.exports.MailgunHelper = MailgunHelper;
