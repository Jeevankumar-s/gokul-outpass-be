// routes/outpassRoutes.js
const express = require('express');
const PDFDocument = require('pdfkit');
const { Outpass } = require('../models');
const { format } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const { v4: jk } = require('uuid');
const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const nodemailer = require('nodemailer');
const router = express.Router();




const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user:"schoutpass@gmail.com",
    pass: "eino hpcu oioo mkbz",
  },
});

const sendAcceptanceEmail = async (email, id, name, role,reason) => {
    const doc = new PDFDocument();
  
    try {
  
      doc.font('./fonts/arial.ttf');
      doc.font('./fonts/ARIBL0.ttf');
  
      // const collegeLogoPath = './images/annailogo.jpg'; 
  
      // const logoImage = fs.readFileSync(collegeLogoPath);
      // doc.image(logoImage, 50, 30, { width: 70, y:70 }); 
      
      doc.moveUp(2)
      doc.fontSize(20).text('Supply Chain Hub', { align: 'center',bold: true, y: -30});
      const lineStartX = 30; // Adjust the X-coordinate as needed
      const lineStartY = doc.y + 30; // Adjust the Y-coordinate to position the line below the text
      const lineEndX = doc.page.width - 30; // Adjust the X-coordinate for the line's end point
      doc.moveTo(lineStartX, lineStartY).lineTo(lineEndX, lineStartY).stroke();
      
      doc.moveDown(5);
      
      doc.fontSize(16).text('OUTPASS DETAILS', { align: 'center', bold: true, color: 'blue' });
      
      const textWidth = doc.widthOfString('OUTPASS DETAILS');
      const textX = (doc.page.width - textWidth) / 2;
      const underlineY = doc.y + 6; // Adjust the Y-coordinate for the underline
      doc.moveTo(textX, underlineY).lineTo(textX + textWidth, underlineY).stroke();
      
  
      doc.moveDown(2);
      
  
  
      const studentNameWidth = doc.widthOfString(`Student Name: ${name}`);
      const studentNameX = (doc.page.width - studentNameWidth) / 2.1;
  
      const istTime = new Date();
      const formattedIstTime = format(istTime, 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Asia/Kolkata' });    
      // const acceptanceDateTime = now.toLocaleString();
      // console.log(formattedIstTime)
      
      
      doc.fontSize(20).text(`Employee Name : ${name}`, studentNameX);
      doc.fontSize(20).text(`Email : ${email}`);
      doc.fontSize(20).text(`Role : ${role}`);
      doc.fontSize(20).text(`Reason: ${reason}`);
      doc.fontSize(20).text(`Date and Time of Acceptance: ${formattedIstTime}`);
      
      doc.moveDown(5);
  
  
 
  
    
      const watermarkText = 'SCH OUTPASS';
  
      const watermarkWidth = doc.widthOfString(watermarkText);
      const watermarkHeight = doc.currentLineHeight();
      const watermarkX = (doc.page.width - watermarkWidth) / 3.9;
      const watermarkY = (doc.page.height - watermarkHeight) / 1.5;
     
      const watermarkRotation = -45; // Negative angle for left tilt
  
      doc.rotate(watermarkRotation, { origin: [watermarkX, watermarkY] })
         .fontSize(45)
         .fillOpacity(0.2)
         .text(watermarkText, watermarkX, watermarkY, { align: 'center'});
  
  
   doc.end();
  
  
      const pdfBuffer = await new Promise((resolve, reject) => {
        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
      });
  
  
      const mailOptions = {
        from: 'schoutpass@gmail.com',
        to: email,
        subject: 'Outpass Accepted',
        text: `Your outpass with ID ${id} has been accepted.`,
        attachments: [
          {
            filename: 'outpass_acceptance.pdf',
            content: pdfBuffer, 
            contentType: 'application/pdf',
          },
        ],
      };
  
  
      const sendMailAsync = util.promisify(transporter.sendMail.bind(transporter));
      await sendMailAsync(mailOptions);
  
  
      console.log('Email sent successfully.');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

router.post('/outpass', async (req, res) => {
  const { name, email, role, reason, } = req.body;

  try {
    const currentUtcTime = new Date();
    const istTime = utcToZonedTime(currentUtcTime, 'Asia/Kolkata');
    const formattedIstTime = format(istTime, 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Asia/Kolkata' });
    const outpassId = jk();

    const newOutpass = await Outpass.create({
      id: outpassId,
      name,
      email,
      role,
      reason,
      current_datetime: formattedIstTime,
      status: 'pending'
    });

    res.status(201).json({ submission: true, outpass: newOutpass });
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: err });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await Outpass.findAll();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/history/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const outpasses = await Outpass.findAll({ where: { name: name } });
    res.json(outpasses);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/outpass/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const outpass = await Outpass.findByPk(id);
    if (!outpass) {
      return res.status(404).json({ error: 'Outpass not found' });
    }
    res.json(outpass);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/outpass/:id/accept', async (req, res) => {
  const { id } = req.params;

  try {
    const [updated] = await Outpass.update(
      { status: 'Accepted' },
      { where: { id } }
    );

    if (updated) {
      const outpass = await Outpass.findByPk(id);
      if (outpass) {
        await sendAcceptanceEmail(
          outpass.email,
          id,
          outpass.name,
          outpass.role,
          outpass.reason
        );
        res.json({ success: true, email: outpass.email });
      } else {
        res.status(404).json({ success: false, message: 'Outpass not found' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Outpass not found' });
    }
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.post('/outpass/:id/decline', async (req, res) => {
  const { id } = req.params;

  try {
    const [updated] = await Outpass.update(
      { status: 'Rejected' },
      { where: { id } }
    );

    if (updated) {
      const outpass = await Outpass.findByPk(id);
      if (outpass) {
        res.json({ success: true, email: outpass.email });
      } else {
        res.status(404).json({ success: false, message: 'Outpass not found' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Outpass not found' });
    }
  } catch (err) {
    
    console.log('Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


module.exports = router;
