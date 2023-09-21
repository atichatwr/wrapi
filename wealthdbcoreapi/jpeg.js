import jpeg  from 'jpeg-js';
import fs from 'fs'
import {createCanvas ,loadImage} from 'canvas';
// import { image } from 'pdfkit';

//-------------------------------------------------------------
// var jpegData = fs.readFileSync('image/Fundconnex_Page_052.jpg');
// var rawImageData = jpeg.decode(jpegData);
// console.log(rawImageData);
// -----------------------------------------------------------

var width = 800,
    height = 600 ;

const canvas = createCanvas(width,height)
const context = canvas.getContext("2d");

loadImage('image/Fundconnex_Page_052.jpg').then((image)=>{

    context.drawImage(image,0,0,width,height);

    context.font = 'bold 48px Arial';
    context.fillStyle = '#000000';
    context.fillText('Hello, World!XXXXXXXXXXXXXXXXXXXXXXXXXX', 50, 200);

    const imagePath = 'image/testJpg2.png';
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(imagePath,buffer);
    console.log(`done ${imagePath}`)

}).catch((err)=>{

    console.log('เกิดข้อผิดพลาด',err)
});
// context.fillStyle = '#ffffff';
// context.fillRect(0,0,width,height);

// context.font = 'bold 48x Arial'
// context.fillStyle = '#000000';
// context.fillText('Hello, World!',50,200)

// const imagePath = 'testoutput.png';
// const buffer = canvas.toBuffer('image/png')
// fs.writeFileSync('image/testJpg2.png',buffer);


// var frameData = new Buffer(width * height * 4);
// var i =0;
// while (i < frameData.length) {
//     frameData[i++] = 0xff; // red
//   frameData[i++] = 0x00; // green
//   frameData[i++] = 0x00; // blue
//   frameData[i++] = 0xff; // alpha - ignored in JPEGs
 
// }

// var rawImageData = {
//     data : frameData,
//     width: width,
//     height: height,
// };
// var jpegImageData = jpeg.encode(rawImageData,50);
// fs.writeFileSync('image/testJpg.jpg',jpegImageData.data);