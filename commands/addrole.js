exports.run = function (client, message, args) {
    if (message.guild.id != "685646226942984206") return;
    else {
        const member = message.guild.member(message.mentions.users.first());
        var roleName = args.splice(1).join(' ')
        const role = message.guild.roles.cache.find(role => role.name === roleName);
        member.roles.add(role);
    }
}