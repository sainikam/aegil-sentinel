const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


const authRoutes = require("./src/routes/auth");
const incidentRoutes = require("./src/routes/incidents");
const unitRoutes = require("./src/routes/units");


app.use("/auth", authRoutes);
app.use("/incidents", incidentRoutes);
app.use("/units", unitRoutes);

app.get("/", (req, res) => {
  res.send("✅ Aegis Sentinel Backend is Running");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Aegis Sentinel backend running on port ${PORT}`));
