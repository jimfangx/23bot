exports.run = function (client, message, args) {
    var guild = message.guild;
    const config = client.config;
    const filter = require('leo-profanity')
    message.delete()
    client.options.disableMentions = "all";
    if (message.author.id != config.owner) {
        message.channel.send(filter.clean(args.join(' ')) + `\n**-${message.author.tag}**`)
    } else if (message.author.id === config.owner) {
        client.options.disableMentions = "none";
        message.channel.send(args.join(' '))
    }
    client.logger.log('info', `say command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
}