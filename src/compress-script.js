const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
  storageBucket: 'drafted-6c302.appspot.com',
});

const db = getFirestore();
const storage = getStorage().bucket();
const ffmpeg = createFFmpeg({ log: true });

const compressAndReuploadVideos = async () => {
  // Load FFmpeg
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  // Fetch all user documents from Firestore
  const usersSnapshot = await db.collection('drafted-accounts').get();

  // Iterate over each user document
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    
    // Process each video field (video1, video2, video3)
    for (let i = 1; i <= 3; i++) {
      const videoField = `video${i}`;
      const videoUrl = userData[videoField];

      if (videoUrl) {
        console.log(`Processing ${videoField} for user: ${userDoc.id}`);

        // Download the video
        const videoResponse = await fetch(videoUrl);
        const videoBuffer = await videoResponse.buffer();
        const originalVideoPath = path.join(__dirname, `original_video${i}.mp4`);
        fs.writeFileSync(originalVideoPath, videoBuffer);

        // Compress the video using FFmpeg
        ffmpeg.FS('writeFile', `original_video${i}.mp4`, await fetchFile(videoBuffer));
        await ffmpeg.run(
          '-i',
          `original_video${i}.mp4`,
          '-c:v',
          'libx264',
          '-crf',
          '28',
          '-preset',
          'fast',
          '-movflags',
          '+faststart',
          `output_video${i}.mp4`
        );
        const compressedData = ffmpeg.FS('readFile', `output_video${i}.mp4`);
        const compressedBlob = Buffer.from(compressedData.buffer);

        // Upload the compressed video to Firebase Storage
        const newFileName = `compressed_${userDoc.id}_video${i}.mp4`;
        const file = storage.file(newFileName);
        await file.save(compressedBlob, {
          contentType: 'video/mp4',
        });

        // Get the download URL of the uploaded compressed video
        const newVideoUrl = await file.getSignedUrl({
          action: 'read',
          expires: '03-17-2025',
        });

        // Update Firestore with the new video URL
        await db.collection('drafted-accounts').doc(userDoc.id).update({
          [videoField]: newVideoUrl[0],
        });

        console.log(`Updated ${videoField} for user: ${userDoc.id}`);
      }
    }
  }

  console.log('All videos have been processed and updated.');
};

compressAndReuploadVideos().catch(console.error);
