const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // allows your React app to talk to this server

const PORT = 3000;

// Temporary hardcoded data — this will later come from a real database
const measures = [
  { id: 1, name: "Retaining Wall", type: "structural", description: "A structure built to hold back soil on a slope." },
  { id: 2, name: "Vegetation Cover", type: "nature-based", description: "Plants and root systems that stabilize soil naturally." },
  { id: 3, name: "Drainage System", type: "structural", description: "Channels excess water away from unstable slopes." }
];

app.get('/api/measures', (req, res) => {
  res.json(measures);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});