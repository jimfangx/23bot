# 23Bot
A custom Discord bot built for the College Prep Class of 2023 Discord server using [discord.js](https://discord.js.org).


## Build from Source
### Environment
* A server/host that supports Node.js hosting, preferably a service that allows persistent storage.
* Node.js
* NPM 

### Build Instructions
* Clone/Download the REPO. Extract/Change directory into the project directory.
* run `npm install` to grab necessary dependencies.
* `node .` or `pm2 start index.js` to start.

## Prebuilt versions
### As this is a custom bot, I will not be providing a prebuilt/hosted version.


## Basic Usage
* `-ping` - Ping
* `-verify` - Begin verification - random 6 digit code is generated & sent to the desired email... The same user executing the command again with the 6 digit code as an arg will be verified.

## Features
* Email based verification - see above for simple breakdown.

## Contributors

* *AirFusion45* - Original Author


## License 
This Project is licensed under MIT License - see the LICENSE.md file for more details. The main points of the MIT License are:
  
  * This code can be used commercially
  * This code can be modified
  * This code can be distributed
  * This code can be used for private use
  * This code has no Liability
  * This code has no Warranty
  * When using this code, credit must be given to the author

## Privacy

### Data We Collect
* No data on the user is collected unless the user runs a command from 23bot. 
* No data on the user is colleected if the user runs the `-ping` command.
* If the user chooses to run the `-verify` command, the following data is collected from the user:
  * The user's unique Discord ID
  * The user's email which they have entered as an argument of the `-verify` command.

### Data Usage
* 23Bot uses the user's unique Discord ID to identify them when the 6 digit verification code is entered
* 23Bot uses the user's email address (entered by the user) to deliver the 6 digit verification code via email.

## Credits / Open Source
* [Chalk](https://github.com/chalk/chalk#readme)
* [Discord.js](https://discord.js.org)
* [MongoDB](https://github.com/mongodb/node-mongodb-native)
* [Nodemailer](https://nodemailer.com/)

## Contact Me
Feel free to contact me if you find bugs, license issues, missing credits, etc.

  * Please contact me here:
    * Email: jfang.cv.ca.us@gmail.com
    * Discord: AirFusion#1706
