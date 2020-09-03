# Dot bot - yasta

A simple discord downloader bot built using DiscordJs. Downloads from Instagram and Tiktok, and adds simple utility commands to prevent raids from rapid server joining and blocks other bot responses to certain commands.


# Requirements

Apart from the npm dependencies listed, the bot uses ffmpeg for video compression. Make sure it's installed on your system in order for the bot to work properly.

$ npm install

## Features

 - Downloader
 - Bot response blocker
	 - use the block command to block a command with two arguments. Unblock and show to remove commands you blocked and show the list of blocked commands, respectively. Example: "yasta block $otherbot command"
 - Anti-Raid
	 - Enabled by default, if a user joins, they're given the "exile" role. The role is meant to remove basic permissions in case of a raid. Depends if the server using the bot has that command or not.

## Variables

By default, the bot uses the "yasta" prefix.
> You can change the bot's prefix in the settings.js file

All environment variables aliases used like special roles or the bot token are listed in the variables.js file
the AUTH1 and AUTH2 variables represent special roles, "admin" and "moderator" that allow privileged use outside of server owners. 


## Hosting on the cloud
If you plan to host the bot on the cloud, like on Heroku, keep in mind the necessary buildpacks used:

[A build pack for puppeteer](https://github.com/jontewks/puppeteer-heroku-buildpack)
 and [a build pack for ffmpeg](https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git)

You should also add each environment variable to the config vars in your application settings so the bot can access them.
