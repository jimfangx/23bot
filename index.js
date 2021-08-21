const { Client, Intents, Collection } = require("discord.js");
const chalk = require('chalk')
const pkg = require('./package.json')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
var config = require('./config.json')
const fs = require('fs');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ], partials: [
        'CHANNEL'
    ]
});

const commands = []
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


const clientId = '801580471317561374';
const guildId = '';

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    // client.commands.set(command.data.toJSON());
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            // Routes.applicationGuildCommands(clientId, guildId),
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(chalk.green("|--------------------(Loading Complete)------------------------|"));
    console.log(chalk.green(`23Bot is now online and ready to go! Here are some information:`));
    console.log(chalk.green(`23Bot loaded successfully @ ${Date()}`));
    console.log(chalk.green(`Owner: ${config.ownerTag}`));
    console.log(chalk.green(`Logged in as: ${config.name} `));
    console.log(chalk.green(`Prefix: ${config.prefix}`));
    client.user.setActivity(`-verify | 23Bot | Version: ${pkg.version}`)
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    if (!client.commands.has(commandName)) return;

    try {
        await client.commands.get(commandName).execute(interaction);
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('guildMemberAdd', member => {
    member.send(`Welcome to the CPS 23' Discord Server ${member.displayName}. Please execute \`/verify <your CPS email here>\` in the #unverified channel of the CPS 23' server to begin verification. For this bot's privacy policy, see: https://github.com/AirFusion45/23bot`)
});

client.on('messageCreate', (msg) => {
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
    if (msg.content.indexOf(config.prefix) !== 0) return;

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
})

var token = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
client.on("debug", error => {
    console.log(chalk.cyan(error.replace(token, "HIDDEN")));
});
client.on("warn", error => {
    console.log(chalk.yellow(error.replace(token, "HIDDEN")));
});
client.on("error", (error) => {
    console.error(chalk.red(error.replace(token, "HIDDEN")));
});
client.login(config.token)