const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    {
      id: "u1",
      name: "Unit Alpha",
      status: "active",
      lastLocation: { type: "Point", coordinates: [74.100, 31.450] }
    }
  ]);
});

router.patch("/:id/location", (req, res) => {
  res.json({ id: req.params.id, message: "Location updated" });
});

module.exports = router;
