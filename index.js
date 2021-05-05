/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Jim Fang. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**  Program Flow

1. user joins
2. either through a command or automatic prompting the bot asks for an email <@college-prep.org> (either through #unverified or DM)
3. bot sends verification code to that email & waits for user feedback
4. code correct -> add verified role, else break;

*/

const Discord = require('discord.js')
const client = new Discord.Client();
let config = require('./config.json')
const mailer = require('nodemailer')
const chalk = require('chalk');
const pkg = require("./package.json");
const emails = require('./allowedEmails.json')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs')
var { DateTime } = require('luxon')

/**
* Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
* See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
*/
const uri = `mongodb+srv://${config.dbUser}:${config.dbPass}@23botcluster.ao4me.mongodb.net/23bot?retryWrites=true&w=majority`;
const database = new MongoClient(uri, { useNewUrlParser: true });


client.on('ready', ready => {
    console.log(chalk.green("|--------------------(Loading Complete)------------------------|"));
    console.log(chalk.green(`23Bot is now online and ready to go! Here are some information:`));
    console.log(chalk.green(`23Bot loaded successfully @ ${Date()}`));
    console.log(chalk.green(`Owner: ${config.ownerTag}`));
    console.log(chalk.green(`Logged in as: ${config.name} `));
    console.log(chalk.green(`Prefix: ${config.prefix}`));
    // console.log(chalk.green(`Ready to serve in ${client.channels} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`));
    client.user.setActivity(`-verify | 23Bot | Version: ${pkg.version}`)

});

database.connect((err, dbClient) => {
    const collection = dbClient.db("23bot").collection("authUsers")
    const quoteCollection = dbClient.db('23bot').collection("quotes")


    client.on('message', async msg => {
        const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
        if (msg.content.indexOf(config.prefix) !== 0) return;

        if (command === 'verify') {
            if (args.join(' ') === "") {
                msg.reply(`Please execute the \`-verify\` command followed by a space then followed by your CPS email. For questions, send a message in #helpline.`)
            } else {
                if (args.join(' ').match(/(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g)) {
                    // if (args.join(' ').indexOf("@college-prep.org", args.join(' ').length - "@college-prep.org".length) !== -1 || args.join(' ').indexOf("@thecollegepreparatoryschool.org", args.join(' ').length - "@thecollegepreparatoryschool.org".length) !== -1) { // send email
                    if (args.join(' ').includes('@college-prep.org') || args.join(' ').includes('@thecollegepreparatoryschool.org')) { // is CPS email
                        if (emails.includes(args.join(' '))) {
                            collection.find({ _id: msg.author.id }).toArray(async function (err, res) {
                                if (res.length === 0) { // no records for this person - send email & generate code
                                    let code = Math.floor(100000 + Math.random() * 900000)
                                    msg.reply(`Verification code has been sent to the email provided. Go check your inbox. Make sure to check your spam folders if you don't receive the message!`)
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
                                        to: args.join(' '),
                                        subject: "CPS '23 Discord Verification",
                                        text: `Here is you verification code for the CPS '23 Discord. If you believe you have received this in error, plese contact yfang@college-prep.org. Your code is: ${code}\nTo get verified, enter this code into the -verify command. You can copy and paste this the following custom command to avoid typing.\n\n-verify ${code}`,
                                    });
                                    var dbInsertObject = {
                                        _id: msg.author.id,
                                        code: code,
                                        email: args.join(' ').trim()
                                    }
                                    collection.insertOne(dbInsertObject, function (err, res) {
                                        if (err) throw err;
                                        console.log("1 document inserted");
                                    })
                                } else { // records exist for this person - send email (args) w/ existing code
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
                                        to: args.join(' '),
                                        subject: "CPS '23 Discord Verification",
                                        text: `Here is you verification code for the CPS '23 Discord. If you believe you have received this in error, plese contact yfang@college-prep.org. Your code is: ${code}\nTo get verified, enter this code into the -verify command. You can copy and paste this the following custom command to avoid typing.\n\n-verify ${code}`,
                                    });
                                }
                            })

                        } else {
                            msg.reply(`Please execute the \`-verify\` command followed by a space then followed by your CPS 23 email. For questions, send a message in #helpline.`)
                        }
                    } else {
                        msg.reply(`Please execute the \`-verify\` command followed by a space then followed by your CPS email. For questions, send a message in #helpline.`)
                    }
                } else if (args.join(' ').trim().length === 6 && /^\d+$/.test(args.join(' ').trim())) { // verify code entered
                    collection.find({ _id: msg.author.id }).toArray(async function (err, res) {
                        if (args.join(' ').trim() == res[0].code) { // verification successful
                            msg.reply(`Verification Successful!`)
                            msg.member.roles.add(msg.member.guild.roles.cache.find(role => role.name === 'Verified'))
                            msg.guild.channels.cache.get('748299448295096351').send(`<@${msg.author.id}>: ${res[0].email}`)
                            // delete db entry
                            var query = { _id: msg.author.id };
                            collection.deleteOne(query, function (err, obj) {
                                if (err) console.log(err)
                                console.log('deleted')
                            })
                        } else {
                            msg.reply(`Code is wrong, please try again. Message in #helpline if you have questions.`)
                        }
                    })
                }
                else {
                    msg.reply(`Please execute the \`-verify\` command followed by a space then followed by your CPS email. For questions, send a message in #helpline.`)
                }
            }
        }

        if (command === 'ping') {
            msg.channel.send(':ping_pong: Pinging...').then((message) => {
                message.edit(`:ping_pong: Pong! Latency is ${message.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
            });
        }

        if (command === 'help') {
            function getRandomIntInclusive(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
            }
            let helpEmbed = new Discord.MessageEmbed()
                .setColor(getRandomIntInclusive(1, 3) === 1 ? "#ccff00" : getRandomIntInclusive(1, 3) === 2 ? "#0072bb" : getRandomIntInclusive(1, 3) === 3 ? "#ff4f00" : "#ccff00")
                .setTitle("23Bot Help\n")
                .addField('Prefix', '`-`, not `~`!')
                .addField('verify', '-verify <CPS email> OR -verify <Verification Code>')
                .addField('ping', '-ping')
                .addField('help', '-help')
                .addField('Assembly Link', '-assembly')
                .addField('WDM Link', '-wdm')
                .addField('Sign up for Common Classroom', '-ccsignup OR -cc')
                .addField('Common Classroom Zoom Links', '-cclinks')
                .addField('Free Period Spaces Signup', `-free (gets today's sheet) OR -free <M/T/R/F> (for specific sheet)`)
                .addField('Special Events (Event description & Zoom link)', `-link`)
                .addField('set [OWNER ONLY]', '-set')
                .addField('restart23 [OWNER ONLY]', '-restart23')
            msg.channel.send({ embed: helpEmbed })
        }

        if (command === 'restart23') {
            if (msg.author.id === config.owner && args.join(' ') === "") {

                msg.channel.send("Restarting...")

                setTimeout(function () {
                    process.abort();
                }, 1000);
            } else {
                msg.channel.send(`e:CLIENT:401:AUTH-FAIL-OR-NO-AUTH`)
            }
        }

        if (command === 'set') {
            if (msg.author.id === config.owner) {
                if (args.join(' ') != "") {
                    switch (args[0]) {
                        case "assembly":
                            config.assembLink = args[1]
                            fs.writeFile('./config.json', JSON.stringify(config), function (e) {
                                if (e) msg.channel.send(`e:CLIENT:${e.code}:WRITE-FAIL`)
                                delete require.cache[require.resolve('./config.json')]
                                config = require("./config.json");
                                msg.channel.send(`Assembly link written to: ${config.assembLink}`)
                            })
                            break;
                        case "wdm":
                            args.splice(0, 1)
                            config.wdmLink = args.join(' ')
                            fs.writeFile('./config.json', JSON.stringify(config), function (e) {
                                if (e) msg.channel.send(`e:CLIENT:${e.code}:WRITE-FAIL`)
                                delete require.cache[require.resolve('./config.json')]
                                config = require("./config.json");
                                msg.channel.send(`WDM link written to: ${config.wdmLink}`)
                            })
                            break;
                        case "ccsignup":
                            config.ccSignup = args[1]
                            fs.writeFile('./config.json', JSON.stringify(config), function (e) {
                                if (e) msg.channel.send(`e:CLIENT:${e.code}:WRITE-FAIL`)
                                delete require.cache[require.resolve('./config.json')]
                                config = require("./config.json");
                                msg.channel.send(`Common Classroom signup link written to: ${config.ccSignup}`)
                            })
                            break;
                        case "cclinks":
                            config.cclinks = args[1]
                            fs.writeFile('./config.json', JSON.stringify(config), function (e) {
                                if (e) msg.channel.send(`e:CLIENT:${e.code}:WRITE-FAIL`)
                                delete require.cache[require.resolve('./config.json')]
                                config = require("./config.json");
                                msg.channel.send(`Common Classroom Zoom links link written to: ${config.cclinks}`)
                            })
                            break;
                        case "freesignup":
                            config[args[1]] = args[2]
                            fs.writeFile('./config.json', JSON.stringify(config), function (e) {
                                if (e) msg.channel.send(`e:CLIENT:${e.code}:WRITE-FAIL`)
                                delete require.cache[require.resolve('./config.json')]
                                config = require("./config.json");
                                msg.channel.send(`Free Signup ${args[1]} written to: ${config[args[1]]}`)
                            })
                            break;
                        case "variablelink":
                            config.variableLink = args[1]
                            fs.writeFile('./config.json', JSON.stringify(config), function (e) {
                                if (e) msg.channel.send(`e:CLIENT:${e.code}:WRITE-FAIL`)
                                delete require.cache[require.resolve('./config.json')]
                                config = require("./config.json");
                                msg.channel.send(`Link written to: ${config.variableLink}`)
                            })
                            break;
                        case "variabledesc":
                            args.splice(0, 1)
                            config.variableDesc = args.join(' ')
                            fs.writeFile('./config.json', JSON.stringify(config), function (e) {
                                if (e) msg.channel.send(`e:CLIENT:${e.code}:WRITE-FAIL`)
                                delete require.cache[require.resolve('./config.json')]
                                config = require("./config.json");
                                msg.channel.send(`Link written to: ${config.variableDesc}`)
                            })
                            break;
                    }
                } else {
                    msg.channel.send(`e:CLIENT:204:NO-ARG`)
                    msg.reply(`assembly|wdm (supports spaces)|ccsignup|cclinks|freesignup (<schedule letter> <link>)|variablelink|variabledesc (supports spaces)`)
                }
            } else {
                msg.channel.send(`e:CLIENT:401:AUTH-FAIL-OR-NO-AUTH`)
            }

        }

        if (command === 'assembly') {
            msg.channel.send(config.assembLink)
        }

        if (command === 'wdm') {
            msg.channel.send(config.wdmLink)
        }

        if (command === 'ccsignup' || command === 'cc') {
            msg.channel.send(config.ccSignup)
        }

        if (command === 'cclinks') {
            msg.channel.send(config.cclinks)
        }

        if (command === 'freesignup' || command === 'free') {
            if (args.join(' ') === '') {
                var today = DateTime.now().setZone('America/Los_Angeles').weekday
                switch (today) {
                    case 1:
                        msg.channel.send(`M Schedule Signup: ${config.m}`)
                        break;
                    case 2:
                        msg.channel.send(`T Schedule Signup: ${config.t}`)
                        break;
                    case 4:
                        msg.channel.send(`R Schedule Signup: ${config.r}`)
                        break;
                    case 5:
                        msg.channel.send(`F Schedule Signup: ${config.f}`)
                        break;
                }
            } else {
                if (args.join(' ').toLowerCase() === 'm' || args.join(' ').toLowerCase().includes('mon')) {
                    msg.channel.send(`M Schedule Signup: ${config.m}`)
                } else if (args.join(' ').toLowerCase() === 't' || args.join(' ').toLowerCase().includes('tue')) {
                    msg.channel.send(`T Schedule Signup: ${config.t}`)
                } else if (args.join(' ').toLowerCase() === 'r' || args.join(' ').toLowerCase().includes('thu')) {
                    msg.channel.send(`R Schedule Signup: ${config.r}`)
                } else if (args.join(' ').toLowerCase() === 'f' || args.join(' ').toLowerCase().includes('fri')) {
                    msg.channel.send(`F Schedule Signup: ${config.f}`)
                }
            }
        }

        if (command === 'link') {
            msg.channel.send(`:warning: This is a variable link for special events.\nEvent Description: **${config.variableDesc}**\nLink: ${config.variableLink}`)
        }

        if (command === 'pin') {
            var msgID = args.join(' ').split('/')
            msgID = msgID[msgID.length - 1]
            var channelID = args.join(' ').split('/')
            channelID = channelID[channelID.length - 2]
            console.log(msgID)
            console.log(channelID)

            client.channels.fetch(channelID).then(channel => {
                channel.messages.fetch(msgID).then(message => {
                    var attachmentLink
                    if (message.attachments.size > 0) {
                        attachmentLink = message.attachments.first().url
                    }
                    var dbInsertObject = {
                        id: message.author.id,
                        content: message.content,
                        attachment: attachmentLink,
                        author: message.author.username + "#" + message.author.discriminator,
                        timestamp: message.createdTimestamp
                    }
                    quoteCollection.insertOne(dbInsertObject, function (err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                        msg.channel.send(':pushpin: Pinned')
                    })
                })
            })
        }

        if (command === 'quote') {
            function getRandomIntInclusive(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
            }
            var lookupID = ""

            if (!isNaN(args.join(' '))) { // its an user id - look up by userid
                lookupID = args.join(' ')
            } else {
                var mention = msg.guild.member(msg.mentions.users.first())
                lookupID = "" + mention.id
            }
            console.log(lookupID)
            if (lookupID === "") return
            quoteCollection.find({ id: lookupID }).toArray(async function (err, res) {
                console.log(res.length)
                var selectedQuote = res[getRandomIntInclusive(0, res.length - 1)]
                var sendEmbed = new Discord.MessageEmbed()
                    .setColor("#f0ffff")
                    .setTitle(`Quote by ${selectedQuote.author}`)
                    .setDescription(selectedQuote.content)
                    .setTimestamp(selectedQuote.timstamp)

                if (selectedQuote.attachment != null) {
                    sendEmbed.setImage(selectedQuote.attachment)
                }
                msg.channel.send({ embed: sendEmbed })
            })

        }

    });
})

client.on('guildMemberAdd', member => {
    member.send(`Welcome to the CPS 23' Discord Server ${member.displayName}. Please execute \`-verify <your CPS email here>\` in the #unverified channel of the CPS 23' server to begin verification. For this bot's privacy policy, see: https://github.com/AirFusion45/23bot`)
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