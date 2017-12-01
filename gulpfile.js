const gulp = require('gulp')
    , fs = require('fs')
    , path = require('path')
    , clean = require('gulp-clean')
    , through2 = require('through2')
    , jsdoc = require('gulp-jsdoc3')

    , sass = require('node-sass')
    , cssmin = require('gulp-cssmin')
    , imagemin = require('gulp-imagemin')
    , pngquant = require("imagemin-pngquant")
    , uglify = require('gulp-uglify')

    , sequence = require('run-sequence')
    , cache = require('gulp-cache')
    , rev = require('gulp-rev')
    , gulpIf = require('gulp-if')
    , revReplace = require('gulp-rev-replace')

    , browserSync = require("browser-sync").create()
    , reload = browserSync.reload

    , browserify = require('browserify')
    , source = require('vinyl-source-stream')
    , babel = require('gulp-babel');

const PATH = {
    dev: "./src/",
    dist: "./dist/"
};

gulp.task('clean:dist', function() {
    return gulp.src(PATH.dist, {read: false})
        .pipe(clean());
});

let importTemplates = (RegExp, replace) => {
    return through2.obj(function(file, enc, cb) {
        let content = file.contents.toString();
        // 导入HTML
        content = content.replace(RegExp, replace);

        file.contents = new Buffer(content);
        this.push(file);
        cb();
    });
};

gulp.task('convertJS', () => {
   return gulp.src(PATH.dev + 'js/**/*.js')
       .pipe(babel({
           presets: ['es2015']
       }))
       .pipe(importTemplates(/__include\([',"](.*)[',"]\)/g, function (str, src) {
           let basePath = path.join(PATH.dev, 'pages/');
           src = path.resolve(basePath, src);

           return fs.existsSync(src) ?
               JSON.stringify(fs.readFileSync(src).toString()) : 'undefined';
       }))
       .pipe(gulp.dest(PATH.dist + '/cache/js'))
});

gulp.task('browserify', () => {
    let b = browserify({
        entries: PATH.dist + "cache/js/app.js"
    });

    return b.bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest(PATH.dist + "js"));
});

gulp.task('sass', function(cb) {
    let filePath = PATH.dist + 'css/app.css';

    sass.render({
        file: PATH.dev + 'sass/app.scss',
        outputStyle: 'expanded'
    }, function (err, result) {
        fs.mkdir(PATH.dist + 'css', 0777, () => {
            fs.writeFile(filePath, result.css, () => {
                gulp.src(filePath)
                    .pipe(gulp.dest(PATH.dist + 'css/'))
                    .on('end', cb)
            });
        });
    });
});

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: PATH.dist
        }
    });

    gulp.watch(PATH.dev + 'sass/*.scss')
        .on('change', () => {
            sequence('sass', browserSync.stream)
        });

    gulp.watch(
        [PATH.dev + 'js/**/*.js', PATH.dev + 'pages/**/*.html'],
    ).on('change', () => {
        sequence('convertJS', 'browserify', reload)
    });
});

gulp.task('default', () => {
    sequence('convertJS', 'browserify', 'sass', 'server')
});