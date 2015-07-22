Color = {};

Color.complementary = function(hex){
  var rgb = this.hex2rgb(hex);
  var r = rgb[0], g = rgb[1], b = rgb[2];

  // see: http://appakumaturi.hatenablog.com/entry/20120121/1327143125
  var sum = Math.max(r, g, b) + Math.min(r, g, b);
  var rC16 = (sum - r < 16 ? "0" + (sum-r).toString(16) : (sum-r).toString(16) );
  var gC16 = (sum - g < 16 ? "0" + (sum-g).toString(16) : (sum-g).toString(16) );
  var bC16 = (sum - b < 16 ? "0" + (sum-b).toString(16) : (sum-b).toString(16) );

  return "#" + rC16 + gC16 + bC16; // rgb to hex
};

Color.reverse = function(hex){
  var rgb = this.hex2rgb(hex);
  var r = rgb[0], g = rgb[1], b = rgb[2];
  
  var rC16 = (255 - r < 16 ? "0" + (255-r).toString(16) : (255-r).toString(16) );
  var gC16 = (255 - g < 16 ? "0" + (255-g).toString(16) : (255-g).toString(16) );
  var bC16 = (255 - b < 16 ? "0" + (255-b).toString(16) : (255-b).toString(16) );

  return "#" + rC16 + gC16 + bC16; // rgb to hex
};

Color.hex2rgb = function(hex){
  var r = parseInt(hex[1] + hex[2], 16); // 先頭[0]は #
  var g = parseInt(hex[3] + hex[4], 16);
  var b = parseInt(hex[5] + hex[6], 16);

  return [r, g, b];
}
