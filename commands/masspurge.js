exports.run = function (client, message, args, args2, cmd1) {
    const config = client.config
    const Discord = require('discord.js');
    var guild = message.guild;
    const embed1 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}masspurge`)
        .addField("**Usage:**", `${config.prefix}masspurge <x page>`)
        .addField("**Example:**", `${config.prefix}masspurge 1`)
        .addField("**Expected Result From Example:**", "1 page of messages should be purged from current channel.")
    if (args.join(' ') == "") return message.channel.send({ embed: embed1 })
    if (message.guild.member(message.author).hasPermission('MANAGE_MESSAGES') || message.guild.member(message.author).hasPermission('ADMINISTRATOR') || message.author.id === config.owner) {
        let messagecount = parseInt(args.join(' '));
        message.channel.messages.fetch({ limit: messagecount*20 }).then(messages => message.channel.bulkDelete(messages)).catch(err => message.reply("Bots can only purge messages that are less than 14 days old. This error could be caused by DiscordAPI Overload"));
    }
    else {
        message.reply('Insufficant Permissions').catch(console.error)
    }
    // logger.log('info', `masspurge command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)
};