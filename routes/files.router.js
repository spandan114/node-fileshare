const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file.model");
const { v4: uuid4 } = require("uuid");
const sendMail = require("../services/emailService");

//multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

//upload instance
let upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 }, //1MB * 100 = 100mb  1mb = 10,00000
}).single("myfile");

//upload file
router.post("/", (req, res) => {
  //store file

  upload(req, res, async (err) => {
    //validate

    if (!req.file) {
      return res.json({ error: "All fields are required" });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }

    // console.log(req.file)

    //store in db

    const file = new File({
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      uuid: uuid4(),
    });

    const response = await file.save();
    //response -> link
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });
});

//email send
router.post("/send", async (req, res) => {

  const {uuid,emailTo,emailFrom} = req.body
  //validate req
  if(!uuid, !emailTo, !emailFrom){
    return res.status(500).send({ error: "All files are required" });
  }

  const file = File.findOne({uuid:uuid});

  if(file.sender){
    return res.status(422).send({ error: "Email already sent." });
  }

  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await (await file).save()

  //send mail
  const data = {
    from:emailFrom,
    to:emailTo,
    subject:'Node.js file sharing ',
    text:`${emailFrom} shared a file with you`,
    html:require('../services/emailTemplate')({
      emailFrom:emailFrom,
      downloadLink:`${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size/1000) + 'KB',
      expires:'24 hours'
    })
  }
  sendMail(data)

})

module.exports = router;
