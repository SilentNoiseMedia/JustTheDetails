// netlify/functions/fetch-video.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { videoId } = event.queryStringParameters;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!videoId || !apiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing videoId or API key' }),
    };
  }

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};