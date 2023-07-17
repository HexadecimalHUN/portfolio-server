require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/email', async (req, res) => {

  //console.log(req.body);
  const { name, email, message, recaptcha } = req.body;
  //verify recaptcha
  console.log(recaptcha);
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptcha}`, {
  method: 'POST'
  });
  
  const result = await response.json();

  console.log(result);
  if (!result.success) {
    console.log('invalid recaptcha');
    return res.status(400).json({ message: 'Invalid reCAPTCHA token' });
  }else{
    console.log('recaptcha success');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
  });

  async function sendMail(name, email, message) {
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USERNAME,
      subject: `New message from ${name}`,
      text: message,
    };
    try{
      const info = await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Message sent successfully' });
    }catch(err){
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  sendMail(name, email, message);
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});