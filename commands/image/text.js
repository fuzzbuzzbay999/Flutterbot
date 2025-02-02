const request = require("request");
require('dotenv').config();
const gm = require("gm").subClass({
	  imageMagick: true
});

const findImage = require('../../utils/findimage.js');

module.exports = {
	name: 'text',
	description: 'Fluttershy Will add text to an image',
 async run(client, message, args) { // eslint-disable-line no-unused-vars
 imageUrl = await findImage.imageFinder(message);
 const extension = await findImage.extensionFinder(imageUrl); 
 console.log(extension); 
	  if (imageUrl !== undefined) {
		      message.channel.startTyping(); 
		       await gm(request(imageUrl)).size((error, size) => { 
		       
		       		       const textsizepercent = Math.round(( 2*10*(size.width/size.height)));		       console.log(textsizepercent); 
		       		       var ratio = size.width / size.height; 
		        let x = size.width * 0.01; // (textsizepercent / 100);
		       let y = size.height * 0.5; //(textsizepercent / 100);
				
		       	var newStr = args.join(' ');
		       
		       if(args.length > 400) 
		       {
		       		message.channel.send(`oh sweetie, I think that's too much text..`); 
		       	
		       	}
		       	
		       	if(size.height > 2000 && size.width > 2000) 
		       	{
		       		message.channel.send(`t-that's way too big of an image for me!🖌️🐇`);
		       		message.channel.stopTyping();	
		       		return;
		       	} 
		       	if(size.height < 400 && size.width < 200) 
		       	{
		       		message.channel.send('that image is so small, your text might not show up!');
		       		
		       	}
		           
		       	
		     //command is layed as -text [message][*][x val][*][y val]
			       var s =newStr;
//checks that there is two astrisks and that there is a y value
 if (s.indexOf("*", s.indexOf("*")+1)>0&&s.indexOf("*", s.indexOf("*")+1)+1<s.length()) {
    var X;

    var Y;

    //location of the first break
    var firstBreak;
    firstBreak = s.indexOf("*");
    //seperates the text
    newStr=s.substring(0, s.indexOf("*"));
    //finds the x value
    X=s.substring(s.indexOf("*")+1, s.indexOf("*", firstBreak+1));
    x=Integer.parseInt(X);
    //find the y value
    Y=s.substring(firstBreak+s.indexOf("*", firstBreak)+X.length()-1, s.length());
    y=Integer.parseInt(Y);
    const picture = gm(request(imageUrl)).fill('#000000').font('Arial', textsizepercent).drawText(x,y, newStr);
  } else {
    const picture = gm(request(imageUrl)).fill('#000000').font('Arial', textsizepercent).drawText(x,y, newStr);

for(i = 0; i < newStr.length - 20; i++) {
  y += 25;
    picture.drawText(x, y, newStr);
    }
 }
		      
		      
		      
		      picture.geometry("+0+0").stream((error, stdout) => {
			            if (error) throw new Error(error);
			            message.channel.stopTyping();
			            message.channel.send({
					            files: [{
							              attachment: stdout,
							              name: "text.png"
							            }]
					          });
			          });
		       });
		    }
}
}
