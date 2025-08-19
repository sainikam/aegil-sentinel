const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    {
      id: "i1",
      type: "intruder",
      confidence: 0.92,
      status: "new",
      location: { type: "Point", coordinates: [74.123, 31.456] },
      srcImage: "https://via.placeholder.com/300",
      createdAt: new Date().toISOString()
    }
  ]);
});

router.post("/", (req, res) => {
  res.status(201).json({ id: "i2", message: "Incident created" });
});

router.patch("/:id", (req, res) => {
  res.json({ id: req.params.id, message: "Incident updated" });
});

module.exports = router;
