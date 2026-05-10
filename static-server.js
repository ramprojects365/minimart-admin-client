const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const browserPath = path.join(__dirname, "dist", "browser");

app.use(express.static(browserPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(browserPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Frontend server listening on port ${port}`);
});
