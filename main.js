var Colors = {
  black   : "#000000",
  blue    : "#0000FF",
  red     : "#FF0000",
  magenta : "#FF00FF",
  green   : "#00FF00",
  cyan    : "#00FFFF",
  yellow  : "#FFFF00",
  white   : "#FFFFFF"
};

var clicking = false;
var canvas = $("#pcanvas");
var painter = true;
var ctx = canvas.get(0).getContext("2d");
var penColor = Colors.black;
var penSize = 2;
var prevX;
var prevY;
// query全部送る
var socket = io.connect("http://localhost:8090", { query: ("r="+ urlQueries()["r"] || "r=power") });
$("#room").html("Room: "+ (urlQueries()["r"] || "power"));

canvas.mousemove(function(e){ draw(e, canvas.get(0)); });
canvas.mousedown(function(){ clicking = true; }); // 押している間だけ描画
canvas.mouseup(function(){
  clicking = false;
  prevX = null; // mouseup時に消しておかないと再度mousedownしたさいに座標がおかしくなる
  prevY = null;
});

$.each(Colors, function(idx, color){
  var d = $("<div>")
    .addClass("palette-color")
    .addClass(idx)
    .css("background-color", color)
    .click(function(){
      penColor = color; // 色を反映
      $(".palette-color").html(""); // チェックマーク
      var icon = $("<i>")
        .addClass("fa")
        .addClass("fa-check")
        .css("color", Color.reverse(color)); // see: color.js
      $(".palette-color."+ idx).html(icon);
    });
  $("#palette").append(d);
});

$("#pen-size").change(function(){
  penSize = $("#pen-size").val();
});
$("#clear").click(function(){
  clear(ctx, canvas.get(0));
});
$("#submit").click(sendAnswer);
$("#ready").click(function(){
  socket.emit("ready");
  $(this).prop("disabled", true);
});
$("#answer").prop("disabled", true);
$("#submit").prop("disabled", true);

socket.on("mouse", function(data){ // マウス座標データが送られてきたら
  ctx.strokeStyle = data.pen.color; // 一時的にペンを変更
  ctx.lineWidth = data.pen.size;
  drawPath(ctx, data.fromX, data.fromY, data.toX, data.toY);

  ctx.strokeStyle = penColor; // 戻す
  ctx.lineWidth = penSize;
});
socket.on("started", function(data){
  console.log("recev", data);
  $("#answer").prop("disabled", false);
  $("#submit").prop("disabled", false);
  if(data.theme){
    $("#theme").html(data.theme);
    $("#answer").prop("disabled", true);
    painter = true;
  }else{
    $("#theme").html("Drawing...");
    $("#answer").prop("disabled", false);
    painter = false;
  }
});
socket.on("theme", function(data){
  if(!painter){
    alert("答えは"+ data.theme +"でした。あなたの答え: "+ $("#answer").val() );
  }
  // 次に備える
  painter = true;
  $("#answer").prop("disabled", true);
  $("#submit").prop("disabled", true);
  $("#ready").prop("disabled", false);
  $("#answer").val("");
  $("#theme").html("");
});

function draw(e, canv){
  if(!clicking) return;
  if(!painter) return;

  var mX = e.pageX - canv.offsetLeft; // clientXはスクロールするとずれる
  var mY = e.pageY - canv.offsetTop;

  ctx.strokeStyle = penColor;
  ctx.lineWidth = penSize;
  ctx.lineJoin = "round"; // pathの連結部分
  ctx.lineCap = "round"; // pathの角

  drawPath(ctx, prevX || mX, prevY || mY, mX, mY); // prevYがnullのとき(まだ１回も描画してない)
  sendCoordinate(prevX || mX, prevY || mY, mX, mY);

  prevX = mX;
  prevY = mY;
}

function drawPath(ctx, fromX, fromY, toX, toY){
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();  // 線として描画
  ctx.closePath();
}

function clear(ctx, canv){
  if(!confirm("Okay?")) return;
  ctx.clearRect(0, 0, canv.width, canv.height);
}

function sendCoordinate(fromX, fromY, toX, toY){
  socket.emit("mouse", {
    fromX: fromX,
    fromY: fromY,
    toX: toX,
    toY: toY,
    pen: {
      color: penColor,
      size: penSize
    }
  });
}

function sendAnswer(){
  socket.emit("answer", {
    answer: $("#answer").val()
  });
}

function urlQueries(){
  var queries = {};
  var querieStrs = location.href.slice(location.href.indexOf('?') + 1).split('&');  // ?の次から
  querieStrs.forEach(function(query, idx){
    var q = query.split("=");
    queries[q[0]] = q[1];
  });
  return queries;
}
