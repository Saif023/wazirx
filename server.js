// server.js

// Enable CORS for all routes

const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
// MongoDB Connection
mongoose.connect(
  "mongodb+srv://saifakhtar023:b5hF4tNwqqEiuROu@cluster1.jblfrpm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define Schema
const cryptoSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});
const Crypto = mongoose.model("Crypto", cryptoSchema);

// Fetch Data from WazirX API

async function fetchDataFromAPI() {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const data = Object.values(response.data).map((item) => ({
      name: item.name,
      last: parseFloat(item.last),
      buy: parseFloat(item.buy),
      sell: parseFloat(item.sell),
      volume: parseFloat(item.volume),
      base_unit: item.base_unit,
    }));
    return data;
  } catch (error) {
    console.error("Error fetching data from WazirX API:", error);
    return [];
  }
}

// Fetch Data from WazirX API

// Store Data in MongoDB
async function storeDataInDB() {
  const data = await fetchDataFromAPI();
  await Crypto.deleteMany({}); // Clear previous data
  await Crypto.insertMany(data);
}

// Route to Get Stored Data
app.get("/crypto", async (req, res) => {
  try {
    const data = await Crypto.find({}, "-_id -__v").limit(10); // Exclude _id and __v fields
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
