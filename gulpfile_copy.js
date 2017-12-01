const gulp = require('gulp')
    , fs = require('fs')
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

var dest = 'dev/';
var src = 'src/';
var env = 'local';
var revStatus;

var importTemplates = function(RegExp, replace) {
    return through2.obj(function(file, enc, cb) {
        var content = file.contents.toString();
        // 导入HTML
        content = content.replace(RegExp, replace);
        file.contents = new Buffer(content);
        this.push(file);
        cb();
    });
};

gulp.task('clean:dev', function() {
    return gulp.src(dest, {read: false})
        .pipe(clean());
});

gulp.task('importTemplate', function () {
    var manifest = gulp.src("rev-manifest.json");
    return gulp.src([src + 'pages/**/*.html'], {base: src})
        .pipe(importTemplates(/@import\s+'(.*?\..*?)'/g, function (str, src) {
            src = __dirname.replace(/\\/g, '/') + '/src/pages/' + src;
            return fs.existsSync(src) ? fs.readFileSync(src).toString() : 'undefined';
        }))
        .pipe(gulpIf(revStatus, revReplace({manifest: manifest})))
        .pipe(gulp.dest(dest + 'cache/'));
});

gulp.task('includeTemplate', ['importTemplate'], function () {
    var manifest = gulp.src("rev-manifest.json");
    return gulp.src([src + 'js/*.js', '!' + src + 'js/router.js', '!' + src + 'js/app.js'], {base: src})
        .pipe(importTemplates(/__include\('(.*)'\)/g, function (str, src) {
            src = __dirname.replace(/\\/g, '/') + '/dev/cache/' + src;
            return fs.existsSync(src) ? JSON.stringify(fs.readFileSync(src).toString()) : 'undefined';
        }))
        .pipe(gulpIf(revStatus, revReplace({manifest: manifest})))
        .pipe(gulp.dest(dest + 'cache/'));
});

gulp.task('build:index', function() {
    var manifest = gulp.src("rev-manifest.json");

    gulp.src(src + 'favicon.ico')
        .pipe(gulp.dest(dest));

    return gulp.src([src + 'index.html'], {base: src})
        .pipe(importTemplates(/@import\s+'(.*?\..*?)'/, function (str, src) {
            src = __dirname.replace(/\\/g, '/') + '/' + src;
            return fs.existsSync(src) ? fs.readFileSync(src).toString() : 'undefined';
        }))
        .pipe(gulpIf(revStatus, revReplace({manifest: manifest})))
        .pipe(gulp.dest(dest));
});

gulp.task('optimizeJS', ['includeTemplate'], function () {
    var include = [];

    var pagePromise = new Promise(function (resolve) {
        fs.readdir('dev/cache/js', function (err, files) {
            files.forEach(function (val) {
                if (/^[Page|ui]/.test(val))
                    include.push(__dirname.replace(/\\/g,'/') + '/dev/cache/js/' + val);
            });
            resolve();
        });
    });

    pagePromise.then(optimize);

    function optimize() {

        var config = {
            name: 'app',
            mainConfigFile: 'src/js/app.js',
            optimize: 'none',
            out: dest + '/assets/js/main.js',
            include: include,
            uglify: {
                warnings: false,            // 是否显示警告。
                inSourceMap: null,          // 输入的源映射。[1]
                outSourceMap: false,        // 输出源映射。[1]
                mangle: {},                 // 不重命名的变量列表。如 {'except': ['$']   }。
                mangleProperties: false,    // 不重命名属性。
                parse: {
                    strict: false,          // 解析时默认启用严格模式。
                    filename: null,         // 设置解析的文档名，主要用于调试。[1]
                    toplevel: null         // 解析所属的顶层语法树节点。
                },
                compress: {
                    sequences: true,        // 将连续语句转为逗号表达式。如 a = 1; return a; → return a=1, a; 。
                    properties: true,       // 将常量属性名转为点表达式。如 a["foo"] → a.foo。
                    dead_code: true,        // 删除永远无法执行的代码。如 if(false) {...} 中的代码。[1]
                    drop_debugger: true,    // 删除 “debugger” 语句。[1]
                    drop_console: true,     // 删除 console.xx 语句。[1]
                    unsafe: false,          // 允许不安全的优化(建议关闭)。如 new Object() → {}。具体见 [不安全代码](https://github.com/mishoo/UglifyJS2#the-unsafe-option)
                    conditionals: true,     // 优化常量条件表达式。
                    comparisons: true,      // 优化比较运算。如 !(a <= b) → a > b (仅当 unsafe 为 true 时优化)和 a = !b && !c && !d && !e → a=!(b||c||d||e)。
                    evaluate: true,         // 尝试执行常量表达式。具体见 [条件编译](https://github.com/mishoo/UglifyJS2#conditional-compilation)
                    booleans: true,         // 优化布尔运算。如 !!a ? b : c → a ? b : c。
                    loops: true,            // 优化常量循环。如 while(true) → while(1)
                    unused: true,           // 删除未引用的局部变量和函数。
                    hoist_funs: true,       // 提升函数定义到函数顶部。
                    hoist_vars: false,      // 提升变量声明到函数顶部。(由于提升会可能导致代码量增加，因此默认为 false。)
                    if_return: true,        // 优化 return/continue 语句后的 if 语句。
                    join_vars: true,        // 合并多个变量声明为同一个 var 语句。
                    cascade: true,          // 尝试简化逗号表达式。如 x, x → x 和 x = something(), x → x = something()。
                    side_effects: true,     // 删除无外部影响的函数调用。如 console.log() 删除后不会影响其它逻辑。
                    pure_getters: false,    // 将所有属性和字段都作为无影响的函数处理。
                    warnings: false,        // 压缩删除代码时是否显示警告。
                    pure_funcs: null,       // 指定无影响的函数列表。如 ["Math.floor"],
                    keep_fargs: true,       // 保留未使用的函数参数。如果设为 false，会导致依赖 Function.prototype.length 的代码出错。
                    keep_fnames: false,     // 保留函数名。如果设为 false，会导致依赖 Function.prototype.name 的代码出错。
                    global_defs: {          // 预设全局常量。[1]
                        DEBUG: false,
                        RELEASE: true
                    },
                    screw_ie8: false       // 不保留 IE8 兼容代码。
                },
                output: {
                    beautify: false,        // 是否格式化代码。
                    indent_level: 4,        // 缩进字符数。(仅当格式化代码时有效)
                    indent_start: 0,        // 每行缩进数。(仅当格式化代码时有效)
                    quote_keys: false,      // 使用引号定义 JSON 对象的键。
                    quote_style: 0,         // 引号风格。0：优先使用双引号。1：全部使用单引号。2：全部使用双引号。3：保留原引号。
                    space_colon: true,      // 在冒号后天添加一个空格。
                    ascii_only: false,      // 编码特殊 Unicode 字符。
                    inline_script: false,   // 编码 "</script"。
                    width: 80,              // 允许最大列数。(仅当格式化代码时有效)
                    max_line_len: 32000,    // 允许最大行号。(仅当压缩代码时有效)
                    screw_ie8: false,       // 不保留 IE8 兼容代码。
                    source_map: null,       // 是否输出源映射。
                    bracketize: false,      // 为单行语句追加使用花括号。
                    preamble: null,         // 在最终源码前追加的文本(一般是一段注释)。
                    comments: /^!|@preserve|@license|@cc_on/i,      // 输出注释。true：保留所有注释；false: 删除所有注释；函数：自定义保留逻辑；正则：匹配则保留[1]
                    semicolons: true       // 使用分号分割语句（否则使用换行）。
                },
                semicolons: true // 使用分号分割语句（否则使用换行）。
            }
        };

        if (revStatus) {
            config.optimize = 'uglify';
            config.out = dest + '/cache/main.js';
        }
        requirejs.optimize(config);
    }
});

gulp.task('sass', function(cb) {
    var manifest = gulp.src("rev-manifest.json");
    var filePath = dest + 'assets/css/app.css';

    sass.render({
        file: src + 'sass/app.scss',
        outputStyle: revStatus ? 'compressed' : 'expanded'
    }, function (err, result) {
        fs.mkdir(dest + 'assets/css', 0777, function (err) {
            fs.writeFile(filePath, result.css, function (err) {
                gulp.src(filePath)
                    .pipe(gulpIf(revStatus, cssmin()))
                    .pipe(gulpIf(revStatus, revReplace({manifest: manifest})))
                    .pipe(gulpIf(revStatus, rev()))
                    .pipe(gulp.dest(dest + 'assets/css/'))
                    .pipe(browserSync.stream())
                    .on('end', cb)
                    .pipe(gulpIf(revStatus, rev.manifest({
                        base: dest,
                        merge: true // 合并json数据
                    })))
                    .pipe(gulpIf(revStatus, gulp.dest(dest)));
            });
        });
    });
});

gulp.task('imagemin', function() {
    return gulp.src(src + "images/**/*.*")
        .pipe(cache(imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true,
            use: [pngquant({quality: '65-80', speed: 4})]
        })))
        .pipe(gulpIf(revStatus, rev()))
        .pipe(gulp.dest(dest + 'assets/images/'))
        .pipe(gulpIf(revStatus, rev.manifest({
            base: dest,
            merge: true // 合并json数据
        })))
        .pipe(gulpIf(revStatus, gulp.dest(dest)));
});

gulp.task('addVersionOnJs', function () {
    var manifest = gulp.src("rev-manifest.json");

    return gulp.src(dest + 'cache/main.js')
        .pipe(revReplace({manifest: manifest}))
        .pipe(rev())
        .pipe(gulp.dest(dest + 'assets/js/'))
        .pipe(rev.manifest({
            base: dest,
            merge: true // 合并json数据
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('clean:surplus', function() {
    return gulp.src([src + 'symbols.svg', 'rev-manifest.json', dest + 'cache'], {read: false})
        .pipe(clean());
});

gulp.task('server', function() {
    browserSync.init({
        ui: false,
        proxy: "http://127.0.0.1:5000",
        port: 81
    });

    gulp.watch(src + 'sass/*.scss', function() {
        sequence('sass');
    });
    gulp.watch(src + 'images/**/*.{png,jpg,gif}', function() {
        sequence('imagemin', reload);
    });
    gulp.watch([src + 'js/**/*.js', '!' + src + 'js/plugin/*.js', '!' + src + 'js/lib/*.js'], function() {
        sequence('optimizeJS', reload);
    });
    gulp.watch([src + 'js/plugin/*.js', src + 'js/lib/*.js'], function() {
        return gulp.src([src + 'js/plugin/*.js', src + 'js/lib/*.js'])
            .pipe(gulp.dest(dest))
            .on('end', function () {
                reload();
            });
    });
    gulp.watch(src + 'pages/**/*.html', function() {
        sequence('optimizeJS', reload);
    });
    gulp.watch(src + 'index.html', function() {
        sequence('build:index', reload);
    });
    gulp.watch([src + 'js/plugin/*.js', src + 'js/lib/*.js'], function () {
        return gulp.src([src + 'js/lib/require.js', src + 'js/plugin/*.js'], {base: src + 'js/'})
            .pipe(cache(gulp.dest(dest + '/assets/js/')))
            .on('end', function () {
                reload();
            });
    });
});

gulp.task('apidoc', function (done) {
    var config = require('./jsdoc.json');
    gulp.src(['README.md', src + '**/*.js', '!' + src + 'js/lib/*.js'], {read: false})
        .pipe(jsdoc(config, done));
});

gulp.task('default', ['clean:dev'], function () {
    return gulp.src([src + 'js/lib/require.js', src + 'js/plugin/*.js'], {base: src + 'js/'})
        .pipe(gulp.dest(dest + '/assets/js/'))
        .on('end', function () {
            sequence('optimizeJS', 'imagemin', 'sass', 'build:index', 'server');
        });
});

gulp.task('release', ['clean:dev'], function() {
    revStatus = true;
    return gulp.src([src + 'js/lib/require.js', src + 'js/plugin/*.js'], {base: src + 'js/'})
        .pipe(uglify())
        .pipe(gulp.dest(dest + '/assets/js/'))
        .on('end', function () {
            sequence('imagemin', 'optimizeJS', 'sass', 'addVersionOnJs', 'build:index', 'clean:surplus');
        });
});

gulp.task('editAPI', function () {
    browserSync.init({
        ui: false
        , port: 81
        , server: {
            baseDir: "docs",
            index: "index.html"
        }
    });

    gulp.watch([src + 'js/core/*.js', src + 'js/plugin/*.js', src + 'js/app.js', src + 'js/router.js', 'README.md'], function() {
        sequence('apidoc', reload);
    });
});