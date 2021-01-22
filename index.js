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
const MongoClient = require('mongodb').MongoClient;

/**
* Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
* See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
*/
const uri = `mongodb+srv://${config.dbUser}:${config.dbPass}@23botcluster.ao4me.mongodb.net/23bot?retryWrites=true&w=majority`;
const database = new MongoClient(uri, { useNewUrlParser: true });


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

database.connect((err, dbClient) => {
    const collection = dbClient.db("23bot").collection("authUsers")


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
                                        text: `Here is you verification code for the CPS '23 Discord. If you believe you have received this in error, plese contact yfang@college-prep.org. Your code is: ${code}\nTo get verified, enter this code into the -verify comomand. You can copy and paste this the following custom command to avoid typing.\n\n-verify ${code}`,
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
                                        text: `Here is you verification code for the CPS '23 Discord. If you believe you have received this in error, plese contact yfang@college-prep.org. Your code is: ${code}\nTo get verified, enter this code into the -verify comomand. You can copy and paste this the following custom command to avoid typing.\n\n-verify ${code}`,
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

    });
})

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