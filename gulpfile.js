var gulp = require('gulp');
var stylus = require("gulp-stylus");
var plumber = require("gulp-plumber");

gulp.task("stylus", function(){
  gulp.src("*.styl")
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest("./"));
});

gulp.task("watch", function(){
  gulp.watch("*.styl", ["stylus"]);
});

gulp.task("default", ["stylus", "watch"]);
