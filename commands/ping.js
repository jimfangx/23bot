exports.run = function (client, message) {
  var guild = message.guild;
  message.channel.send(':ping_pong: Pinging...').then((msg) => {
    msg.edit(`:ping_pong: Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  });
  client.logger.log('info', `ping command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
}