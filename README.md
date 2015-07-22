# Painton

**WebSocket**と**Canvas**(とNodeとSocket.ioとStylusとGulp)を用いたお絵かきクイズ

## Installation
1. Clone this repository
2. 任意: ポート番号
  * ws_server.jsの1行目のポート番号を変更
    `var io = require("socket.io").listen(**8090**);`
  * main.jsの21行目ぐらいのホスト・ポート番号を変更
    `var socket = io.connect(**"http://localhost:8090"**, { query: ("r="+ urlQueries()["r"] || "r=power") });`
