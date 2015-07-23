var io = require("socket.io").listen(8090);
var to_json = require("xmljson").to_json;
var request = require("request");

var themes = [
  "ぞう",
  "キリン",
  "Scatman",
  "哲学",
  "大阪",
  "Android",
  "エアコン",
  "はさみ",
  "Minecraft",
];

request.get({ // バズワード取得
  url: "http://kizasi.jp/kizapi.py?type=rank"
}, function(err, res, body){
  if(!err && res.statusCode == 200){
    to_json(body, function(error, data){
      var items = data.rss.channel.item;
      for(var i = 0; i < Object.keys(items).length; i++){
        themes.push(items[i].title); // バズワードをテーマに追加
      }
    });
  }
});

var roomAnswers = {}; // roomごとに答えを一時保存
var readyClients = {};
var currentThemes = {};
var acceptClients = {};

io.on("connection", function(socket){
  var room = socket.handshake.query.r;
  socket.join(room);
  if(clientsInRoom(room) == 1){ // room初期化(初めてのルーム参加者だったら)
    readyClients[room] = [];
    roomAnswers[room] = {};
    acceptClients[room] = [];
  }

  socket.on("mouse", function(data){ // マウス操作時
    io.to(room).emit("mouse", data);
  });

  socket.on("requestClear", function(){
    io.to(room).emit("requestClear", { from: socket.id });
  });

  socket.on("acceptClear", function(){
    acceptClients[room].push(socket.id);
    if(acceptClients[room].length == clientsInRoom(room) - 1){ // fromを除いて全員readyなら
      io.to(room).emit("acceptedClear");
      acceptClients[room] = [];
    }
  });

  socket.on("ready", function(){
    // ゲームスタート、お題を送信
    if(readyClients[room].hasOwnProperty(socket.id)) { return; }
    readyClients[room].push(socket.id);
    if(readyClients[room].length == clientsInRoom(room)){ // 全員readyなら
      var painter = election(room);
      currentThemes[room] = randomTheme();
      io.to(room).emit("started", { painter: painter });
      io.to(painter).emit("started", { theme: currentThemes[room], painter: painter });
    }
  });

  socket.on("answer", function(data){
    roomAnswers[room][socket.id] = data.answer; // 追加ではなく代入なので何回でも回答できる
    if(Object.keys(roomAnswers[room]).length == clientsInRoom(room) - 1){ // 全員答えたら(painterのぞく)
      sendAnswer(room);
      // 次に備える
      readyClients[room] = [];
      roomAnswers[room] = {};
      currentThemes[room] = "";
    }
  });
});

function election(room){ // ランダムにroom中のsocket.idを返す
  var clients = Object.keys(io.sockets.adapter.rooms[room]);
  var r = Math.floor(Math.random() * clients.length);
  return clients[r];
}

function randomTheme(){
  var r = Math.floor(Math.random() * themes.length);
  return themes[r];
}

function sendAnswer(room){
  var theme = currentThemes[room];
  io.to(room).emit("theme", {theme: theme} );
}

function clientsInRoom(room){
  return Object.keys(io.sockets.adapter.rooms[room] || {}).length;
}
