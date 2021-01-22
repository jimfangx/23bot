/** 

1. user joins
2. either through a command or automatic prompting the bot asks for an email <@college-prep.org> (either through #unverified or DM)
3. bot sends verification code to that email & waits for user feedback
4. code correct -> add verified role, else break;

*/

const Discord = require('discord.js')
const client = new Discord.Client();
const config = require('./config.json')
const mailer = require('nodemailer')
const chalk = require('chalk');
const pkg = require("./package.json");
const emails = require('./allowedEmails.json')

client.on('ready', ready => {
    console.log(chalk.green("|--------------------(Loading Complete)------------------------|"));
    console.log(chalk.green(`DB8Bot is now online and ready to go! Here are some information:`));
    console.log(chalk.green(`DB8Bot loaded successfully @ ${Date()}`));
    console.log(chalk.green(`Owner: ${config.ownerTag}`));
    console.log(chalk.green(`Logged in as: ${config.name} `));
    console.log(chalk.green(`Prefix: ${config.prefix}`));
    // console.log(chalk.green(`Ready to serve in ${client.channels} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`));
    client.user.setActivity(`-help | DB8Bot | Version: ${pkg.version}`)
});

client.on('message', async msg => {
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
    if (msg.content.indexOf(config.prefix) !== 0) return;

    if (command === 'verify') {
        console.log(args.join(' '))
        if (args.join(' ') === "") {
            msg.reply(`Please execute the \`-verify\` command followed by a space then followed by your CPS email. For questions, send a message in #helpline.`)
        } else {
            if (args.join(' ').match(/(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g)) {
                // if (args.join(' ').indexOf("@college-prep.org", args.join(' ').length - "@college-prep.org".length) !== -1 || args.join(' ').indexOf("@thecollegepreparatoryschool.org", args.join(' ').length - "@thecollegepreparatoryschool.org".length) !== -1) { // send email
                if (args.join(' ').includes('@college-prep.org') || args.join(' ').includes('@thecollegepreparatoryschool.org')) { // is CPS email
                    if (emails.includes(args.join(' '))) {
                        let transporter = mailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 465,
                            secure: true,
                            auth: {
                                user: config.transportUser,
                                pass: config.transportPass,
                            },
                        });
                        let sendInfo = await transporter.sendMail({
                            from: '"CPS Class of 23 Verification Service" <cps23authentication@gmail.com>',
                            to: "yfang@college-prep.org",
                            subject: "Test msg",
                            text: "test msg ${ur verification code}",
                        });
                    } else {
                        msg.reply(`Please execute the \`-verify\` command followed by a space then followed by your CPS 23 email. For questions, send a message in #helpline.`)
                    }
                } else {
                    msg.reply(`Please execute the \`-verify\` command followed by a space then followed by your CPS email. For questions, send a message in #helpline.`)
                }
            } else {
                msg.reply(`Please execute the \`-verify\` command followed by a space then followed by your CPS email. For questions, send a message in #helpline.`)
            }
        }
    }

    if (command === 'ping') {
        msg.channel.send(':ping_pong: Pinging...').then((message) => {
            message.edit(`:ping_pong: Pong! Latency is ${message.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
        });
    }

});

client.on('guildMemberAdd', member => {
    member.send(`Welcome to the CPS 23' Discord Server ${member.displayName}. Please execute \`-verify <your CPS email here>\` in the #unverified channel of the CPS 23' server to begin verification.`)
});

var token = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
client.on("debug", error => {
    console.log(chalk.cyan(error.replace(token, "HIDDEN")));
});
client.on("warn", error => {
    console.log(chalk.yellow(error.replace(token, "HIDDEN")));
});
// client.on("err", error => {
//     console.log(chalk.red(error.replace(token, "HIDDEN")));
// }); //Broken
client.on("error", (error) => {
    console.error(chalk.red(error.replace(token, "HIDDEN")));
});

client.login(config.token);