const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  res.json({
    token: "mock_jwt_token",
    user: { id: "admin01", name: "Admin User", role: "admin" }
  });
});

module.exports = router;
