var gulp = require('gulp');
var less = require('gulp-less');
var spawn = require('child_process').spawn;
var node;

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix = new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

gulp.task('less',function(){
	gulp.src('./less/site.less')
		.pipe(less({plugins: [autoprefix]}))
		.pipe(gulp.dest('./www/css'));	
})

gulp.task('watch',function(){
	gulp.watch('./less/**/*.less', ['less']);
})

gulp.task('server', function() {
  if (node) node.kill()
  node = spawn('imba', ['src/server.imba'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

gulp.task('default', function() {
  gulp.run('server')

  gulp.watch(['./src/**/*.imba','./docs/**/*.md','./docs/**/*.imba'], function() {
  	console.log('watching');
    gulp.run('server');
  })
})

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
});