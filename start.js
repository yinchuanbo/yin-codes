var liveServer = require("live-server");

var params = {
  port: 4444,
  host: "0.0.0.0",
  root: "./pages",
  open: false,
  file: "index.html",
};

liveServer.start(params);
