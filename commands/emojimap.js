exports.run = function (client, message, args, args2, cmd, config) {
    var guild = message.guild;
    const emojiList = message.guild.emojis.cache.map(e => e.toString()).join(" ");
    if (emojiList == "") {
        message.channel.send("No custom emojies found on the current server.")
    } else {
        message.channel.send(emojiList);
    }
    // logger.log('info', `Emojimap command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)
}