const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
require('dotenv').config()
const cors = require('cors');
const app = express();
app.use(cors());
const port = 5000;

const s3 = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  }
});

mongoose.connect('mongodb://localhost:27017/inzint', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const videoSchema = new mongoose.Schema({
  thumb_url: String,
  video_url: String
});

const Video = mongoose.model('Video', videoSchema);



const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket:process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});


// Set up routes for file uploads and database operations
app.post('/api/upload', upload.single('file'), async(req, res) => {
  console.log('hii');
  try {
    const videoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${req.file.key}`;
    const videoname=req.file.key.replace('.mp4','')
    const thumbnailUrl= `https://inzint-challenge-video-thumbnail.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${videoname}-0.jpg`;
    const video=new Video({
      thumb_url:thumbnailUrl,
      video_url:videoUrl
    })
    await video.save()
    console.log(thumbnailUrl)
    console.log(videoname)
    console.log('running post request...')
    console.log(videoUrl)
      res.send('Video and thumbnail url saved to db successfully!');
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }

});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});