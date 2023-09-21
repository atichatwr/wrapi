
import PDFDocument  from'pdfkit';
import fs from 'fs'
import mobileClass from './mobileClass.js';
const doc = new PDFDocument();
// const mobilecard = new mobileClass ()
// const mobilecard = new mobileClass (cardNo)
// console.log(global.myVariable); // Output: 'Hello again!'
// console.log('xxxxxxx'); 
// ไฟล์ otherModule.js
// module.exports = function(myvul){
//   console.log('new variable',myvul)
// }
// destination.js

const myVariable = process.argv[2];
const myVariable2 = process.argv[3] ;

console.log(`Received variable: ${process}`);

// console.log('xxx')
// console.log(mobilecard.processData()); // แสดงผล: Hello, world!
doc.text('This is the first line xxx'+myVariable);
doc.text('This is the first line yyy'+myVariable2);

// เรียกใช้ฟังก์ชั่นที่แยกออกมา
exampleFunction();

doc.text('This is the third line.');
// doc.text(globalThis.cardNO);
// doc.text(global.myVariable); 
 

doc.pipe(fs.createWriteStream('output.pdf'));
doc.end();

// Output: 'Hello again!'
// ฟังก์ชั่นที่แยกออกมา
function exampleFunction() {
  doc.text('This is the second line.');
  // doc.text('This is the second line.'+global.myVariable + ' TEST');
}
