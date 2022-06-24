const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
let oneStepBack = path.join(__dirname, '../');

//Global queue for your bot. Every server will have a key and value pair in this map. { guild.id, queue_constructor{} }
const queue = new Map();


module.exports = {
    name: 'play',
    aliases: ['skip', 'stop', 'queue',], //We are using aliases to run the skip and stop command follow this tutorial if lost: https://www.youtube.com/watch?v=QBUJ3cdofqc
    cooldown: 0,
    description: 'Advanced music bot',
    async execute(message, args, cmd, client, Discord, debug){

const serverQueue = queue.get(message.guild.id); 

       
        //Checking for the voicechannel and permissions (you can add more permissions if you like).
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('Pardon me uhm... you need to be in a voice channel for me to play music...');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('Im so sorry, I dont have permission to do that. Please dont be mad at me');
        if (!permissions.has('SPEAK')) return message.channel.send('Im so sorry, I dont have permission to do that. Please dont be mad at me');

        //This is our server queue. We are getting this server queue from the global queue.
        const server_queue = queue.get(message.guild.id); 
       

        //If the user has used the play command 

        switch (cmd)
        {
            case "play":
                if (!args.length) return message.channel.send('uh.. uhmm.. You need to send the second argument.. I mean, if you want to...');
                let song = {};

                //If the first argument is a link. Set the song object to have two keys. Title and URl.
                if (ytdl.validateURL(args[0])) {
                    const song_info = await ytdl.getInfo(args[0]);
                    song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
                    if (debug) { message.channel.send(song) }
                } else {
                    //If there was no link, we use keywords to search for a video. Set the song object to have two keys. Title and URl.
                    const video_finder = async (query) => {
                        const video_result = await ytSearch(query);
                        return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                    }

                    const video = await video_finder(args.join(' '));
                    if (video) {
                        song = { title: video.title, url: video.url }
                    } else {
                        message.channel.send('Im so sorry, Im having trouble finding this video');
                    }
                }

                //If the server queue does not exist (which doesn't for the first video queued) then create a constructor to be added to our global queue.
                if (!server_queue) {

                    const queue_constructor = {
                        voice_channel: voice_channel,
                        text_channel: message.channel,
                        connection: null,
                        songs: []
                    }

                    //Add our key and value pair into the global queue. We then use this to get our server queue.
                    queue.set(message.guild.id, queue_constructor);
                    queue_constructor.songs.push(song);

                    //Establish a connection and play the song with the vide_player function.
                    try {
                        const connection = await voice_channel.join();
                        queue_constructor.connection = connection;
                        video_player(message.guild, queue_constructor.songs[0], server_queue);
                    } catch (err) {
                        queue.delete(message.guild.id);
                        message.channel.send('uhhm. Excuse me. i. Im having trouble connecting...');
                        throw err;
                    }
                } else {

                    //load_savedqueue(oneStepBack + "assets/music_queue.json"); 
                    server_queue.songs.push(song);

                    return message.channel.send(`Okay! **${song.title}** added to queue!`);
                    break; 
                }         

            case "queue": getqueue(message.guild, message, server_queue, args);


            case "skip": skip_song(message, server_queue, message.guild);

            case "stop": stop_song(message, server_queue);


            default:
                return; 

        
        }
    
}}

const video_player = async (guild, song, server_queue) => {
    const song_queue = queue.get(guild.id);

    //If no song is left in the server queue. Leave the voice channel and delete the key and value pair from the global queue.
    if (!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);



        return;
    }
 
    song_queue.voice_channel.join().then(connection => {
       
        const stream = ytdl(song.url, { highWaterMark: 1 << 25 }, { filter : 'audioonly' }); 
            const dispatcher = connection.play(stream, {seek: 0, volume: 1});
            dispatcher.on('finish', () => {
               
                song_queue.songs.shift();
                                 video_player(guild, song_queue.songs[0]);
            });
        }).catch(err => console.log(err));
        
       
         
        await song_queue.text_channel.send(`🎶 Now playing **${song.title}**`)
}



const skip_song = (message, server_queue, guild) => {
	const song_queue = queue.get(guild.id);
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if(!server_queue){
        return message.channel.send(`There are no songs in queue 😔`);
    }
   
   // song_queue.voice_channel.leave();
   
     song_queue.songs.shift();
     video_player(guild, song_queue.songs[0]);
	
}

const stop_song = (message, server_queue, guild) => {
	
    if (!message.member.voice.channel) return message.channel.send('uhhm. Excuse me. I think you may need to be in a voice channel for me to be able to do this... Im so sorry');
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
} 


const getqueue = async (guild, message, server_queue, args) => { 
	
    //var a = server_queue.songs;  
     //console.log(server_queue[0].title); 
     //console.log(args); 
     //var cmd2 = args[0];
     var farts = args[0]; 
     switch (args[0])
     {
     	
     	case 'save':
     		  preserve_queue(server_queue.songs);   
     		   message.channel.send("music player queue saved to log file"); 
     		   break; 
     	
     	
     	case 'restore':
     		
     		 message.channel.send("loading previous queue from save file...");
     		 load_savedqueue(oneStepBack + "assets/music_queue.json"); 
     		 message.channel.send("this function is still a WIP");  
     		 message.channel.send(load_savedqueue, {code: "json"});
     		 break;
    
         
     	default:
     	        	
    if(server_queue.songs.length <= 1) 
    {
    	 let vidInfo = await ytdl.getInfo(server_queue.songs[0].url); 

    	    const embed = new MessageEmbed().setTitle(`**I'm Currently Playing:** \n[${server_queue.songs[0].title}](${server_queue.songs[0].url})`).setImage(getvideoimage(vidInfo)); 

    	 
    	 
    	   	
    	 message.channel.send(embed); 
    } 	
    
    if(server_queue.songs.length >= 2 ) {
    	
    //let size = server_queue.songs.length; 

     	
     let vidInfo1 = await ytdl.getInfo(server_queue.songs[1].url); 
     const embed = new MessageEmbed().setTitle(`**I'm Currently Playing:** \n[${server_queue.songs[0].title}](${server_queue.songs[0].url})').addField(\n\n**Up Next:** \n `).setThumbnail(getvideoimage(vidInfo1)).addField("Songs: \n", `\`${server_queue.songs.length}\``, true) 
     
     
     server_queue.songs.forEach(element => {
     	embed.addField(`${element.title}`)
     	}); 
     
     message.channel.send(embed); 
     
    
    }

     	
     	
     	
     	
     }
     
      
     }
  

        	
function getvideoimage(vidinfo) 
 {
 	
    return vidinfo.player_response.videoDetails.thumbnail.thumbnails[0].url;
 
 }



async function preserve_queue(queue) 
{
	console.log("function is working"); 
	
	
	
		
		

	
	//console.log(info); 
	//console.log(queue); 
	const queue_toObject = {"Songs": "  "}; 
	queue_toObject.push(queue); 
	console.log(queue_toObject); 

    const json = JSON.stringify(queue_toObject).replace(/[+|]+/g, '').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"); 

    fs.writeFile(oneStepBack + "assets/music_queue.json", json, function (err, result) {
        if (err) console.log('error', err);
    });

} 


function load_savedqueue(queue_file) 
{
	
	console.log("reading saved queue"); 
	
	const saved_songs = JSON.parse(oneStepBack + queue_file); 
	
	
	//console.log(saved_songs); 
	return saved_songs; 
	
	
	
	
}


