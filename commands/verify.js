const { SlashCommandBuilder } = require('@discordjs/builders');
const emails = require('../allowedEmails.json')
const MongoClient = require('mongodb').MongoClient;
const mailer = require('nodemailer')
const config = require('../config.json')
const uri = `mongodb+srv://${config.dbUser}:${config.dbPass}@23botcluster.ao4me.mongodb.net/23bot?retryWrites=true&w=majority`;
const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Email verification for CPS students')
        .addStringOption(option =>
            option.setName('argument')
                .setDescription('Your CPS email (@college-prep.org or @thecollegepreparatoryschool.org) OR 6 digit verification code')
                .setRequired(true)
        ),
    async execute(interaction) {
        database.connect(async (err, dbClient) => {
            const collection = dbClient.db("23bot").collection("authUsers")
            var args = interaction.options.getString('argument')
            if (args.match(/(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g)) {
                if (args.includes('@college-prep.org') || args.includes('@thecollegepreparatoryschool.org')) {
                    if (emails.includes(args)) {
                        collection.find({ _id: interaction.user.id }).toArray(async function (err, res) {
                            if (res.length === 0) { // no records for this person - send email & generate code
                                let code = Math.floor(100000 + Math.random() * 900000)
                                interaction.reply({ content: `Verification code has been sent to the email provided. Go check your inbox. Make sure to check your spam folders if you don't receive the message!`, ephemeral: true })
                                let transporter = mailer.createTransport({
                                    host: "smtp.gmail.com",
                                    port: 465,
                                    secure: true,
                                    auth: {
                                        user: config.transportUser,
                                        pass: config.transportPass,
                                    },
                                });
                                await transporter.sendMail({
                                    from: '"CPS Class of 23 Verification Service" <cps23authentication@gmail.com>',
                                    to: args,
                                    subject: "CPS '23 Discord Verification",
                                    text: `Here is you verification code for the CPS '23 Discord. If you believe you have received this in error, plese contact yfang@college-prep.org. Your code is: ${code}\nTo get verified, enter this code into the /verify command. You can copy and paste this the following custom command to avoid typing.\n\n/verify ${code}`,
                                });
                                var dbInsertObject = {
                                    _id: interaction.user.id,
                                    code: code,
                                    email: args.trim()
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
                                await transporter.sendMail({
                                    from: '"CPS Class of 23 Verification Service" <cps23authentication@gmail.com>',
                                    to: args,
                                    subject: "CPS '23 Discord Verification",
                                    text: `Here is you verification code for the CPS '23 Discord. If you believe you have received this in error, plese contact yfang@college-prep.org. Your code is: ${res[0].code}\nTo get verified, enter this code into the /verify command. You can copy and paste this the following custom command to avoid typing.\n\n/verify ${res[0].code}`,
                                });
                                interaction.reply({ content: `Verification code has been sent to the email provided. Go check your inbox. Make sure to check your spam folders if you don't receive the message!`, ephemeral: true })
                            }
                        })
                    } else {
                        interaction.reply({ content: `Please execute the \`/verify\` command followed by a space then followed by your CPS 23 email. For questions, send a message in #helpline.`, ephemeral: true })
                    }
                } else {
                    interaction.reply({ content: `Please execute the \`/verify\` command followed by a space then followed by your CPS email. For questions, send a message in #helpline.`, ephemeral: true })
                }
            } else if (args.trim().length === 6 && /^\d+$/.test(args.trim())) {
                collection.find({ _id: interaction.user.id }).toArray(async function (err, res) {
                    try {
                        if (args.trim() == res[0].code) { // verification successful
                            interaction.reply({ content: `Verification Successful!`, ephemeral: true })
                            interaction.guild.members.fetch(interaction.user.id).then(member => {
                                member.roles.add(interaction.guild.roles.cache.find(role => role.name === 'Verified'))
                            })
                            interaction.guild.channels.cache.get('748299448295096351').send(`<@${interaction.user.id}>: ${res[0].email}`)

                            // delete db entry
                            var query = { _id: interaction.user.id };
                            collection.deleteOne(query, function (err, obj) {
                                if (err) console.log(err)
                                console.log('deleted')
                            })
                        } else {
                            interaction.reply({ content: `Code is wrong, please try again. Message in #helpline if you have questions.`, ephemeral: true })
                        }
                    } catch (err) {
                        interaction.reply({ content: `Code does not exist! Try requesting a new code using \`/verify\``, ephemeral: true })
                    }
                })
            } else {
                interaction.reply({ content: `Please execute the \`/verify\` command followed by a space then followed by your CPS email. For questions, send a message in #helpline.`, ephemeral: true })
            }
        })
    },
};