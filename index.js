const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
// const { generateToken04 } = require('./utils/token04');
// const { ZegoUIKitPrebuilt } = require('@zegocloud/zego-uikit-prebuilt');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const appID = process.env.ZEGO_APP_ID;
const serverSecret = process.env.ZEGO_SERVER_SECRET;

app.get('/api/get-token', async (req, res) => {
  const { roomID, userID, userName } = req.query;

  if (!roomID || !userID || !userName) {
    return res.status(400).json({ error: 'Missing required params' });
  }

  // try {
  //   const effectiveTimeInSeconds = 3600;
  //   const payload = '';
  //   const token = generateToken04(appID, userID, serverSecret, effectiveTimeInSeconds, payload);
  //   console.log("Generated token:", token); // Temporary debug log
  //   res.json({ token, userName });
  // } catch (error) {
  //   console.error("Token generation error:", error);
  //   res.status(500).json({ error: error.errorMessage || 'Token generation failed' });
  // }
  
  try {
    const base64Creds = Buffer.from(`${appID}:${serverSecret}`).toString('base64');

    const response = await axios.post('https://rtc-api.zegocloud.com/v1/token', {
      app_id: parseInt(appID),
      user_id: userID,
      room_id: roomID,
      privilege: {
        "1": 1, // login room
        "2": 1  // publish stream
      },
      expire_time: 3600 // in seconds
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Creds}`
      }
    });

    res.json({ token: response.data.data.token });
  } catch (error) {
    console.error('Error generating kit token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));