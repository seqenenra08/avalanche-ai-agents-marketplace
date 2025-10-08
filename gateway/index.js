import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

const MY_API_KEY = process.env.MY_API_KEY;

async function uploadToPinata(metadata) {
  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    metadata,
    {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
    }
  );
  return res.data.IpfsHash;
}

app.post('/upload', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== MY_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const metadata = req.body;
    console.log('Received metadata:', metadata);

    if (!metadata.name || !metadata.endpoint || !metadata.category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ipfsHash = await uploadToPinata(metadata);
    res.json({ message: 'Metadata uploaded successfully', ipfsHash, ipfsLink: `ipfs://${ipfsHash}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: err.response?.data || err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));