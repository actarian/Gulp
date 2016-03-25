/// <binding ProjectOpened='typescript' />
'use strict';

var gulp = require('gulp'),
    vinyl = require('vinyl-paths'),
    del = require('del'),
    rewrite = require('connect-modrewrite'),
    webserver = require('gulp-webserver'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    sourcemaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    jade = require('gulp-jade'),
    typescript = require('gulp-typescript');

var paths = {
    node: './node_modules',
    bower: './bower_components',
    src: './src',
    wwwroot: './wwwroot',
};

var folders = {
    css: '/css',
    js: '/js',
    vendors: '/vendors',
    typescript: '/js',
    jade: '/',
};

var matches = {
    everything: '/**/*.*',
    less: '/**/*.less',
    js: '/**/*.js',
    jsMin: '/**/*.min.js',
    jade: '/**/*.jade',
    typescript: '/**/*.ts',
}

var names = {
    vendors: '/vendors.js',
}

paths.vendors = paths.wwwroot + folders.js + folders.vendors;

/**** VENDORS */
gulp.task('vendors:clean', function() {
    return gulp.src(paths.vendors + matches.everything)
        .pipe(plumber(function(error) {
            console.log('vendors:clean error', error);
        }))
        .pipe(vinyl(del));
    // return del([paths.vendors + matches.everything]);    
});

/**** ANGULARJS */
var angularjs = {
    src: [
        paths.bower + '/angular/angular.js',
        paths.bower + '/angular-route/angular-route.js',
        paths.bower + '/angular-animate/angular-animate.js',
    ]
}
gulp.task('angularjs:compile', function() {
    return gulp.src(angularjs.src, { base: '.' })
        .pipe(plumber(function(error) {
            console.log('angularjs:compile error', error);
        }))
        .pipe(rename({
            dirname: '', // flatten directory
        }))
        .pipe(gulp.dest(paths.vendors)) // save files
        /*
        .pipe(sourcemaps.init())
        .pipe(concat(paths.vendors + names.vendors))
        .pipe(gulp.dest('.')) // save .js
        .pipe(uglify({ preserveComments: 'license' }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.')); // save .min.js
        */  
});

gulp.task('angularjs', ['vendors:clean', 'angularjs:compile'], function(done) { done(); });

/**** ANGULAR2 */
var angular2 = {
    src: [
        paths.node + '/es6-shim/es6-shim.*',
        paths.node + '/es6-promise/dist/es6-promise.*',
        paths.node + '/angular2/es6/dev/src/testing/shims_for_IE.*',
        paths.node + '/angular2/bundles/angular2-polyfills.*',
        paths.node + '/angular2/bundles/angular2.*.*',
        paths.node + '/angular2/bundles/http.*.*',
        paths.node + '/angular2/bundles/router.*.*',
        paths.node + '/rxjs/bundles/Rx.*',
        paths.node + '/systemjs/dist/*.*',
    ]
}
gulp.task('angular2:compile', function() {
    return gulp.src(angular2.src, { base: '.' })
        .pipe(plumber(function(error) {
            console.log('angular2:compile error', error);
        }))
        .pipe(rename({
            dirname: '', // flatten directory
        }))        
        .pipe(gulp.dest(paths.vendors)) // save files
        /*
        .pipe(sourcemaps.init())
        .pipe(concat(paths.vendors + names.vendors))
        .pipe(gulp.dest('.')) // save .js
        .pipe(uglify({ preserveComments: 'license' }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.')); // save .min.js
        */  
});
gulp.task('angular2', ['vendors:clean', 'angular2:compile'], function(done) { done(); });

/**** JADE */
gulp.task('jade:compile', function() {
    var options = {
        pretty: true,
    };
    return gulp.src(paths.src + matches.jade)
        .pipe(plumber(function(error) {
            console.log('jade:compile error', error);
        }))
        .pipe(jade({ locals: options }))
        .pipe(gulp.dest(paths.wwwroot));
});
gulp.task('jade:watch', function() {
    var watcher = gulp.watch(paths.src + matches.jade, ['jade:compile']);
    watcher.on('change', function(e) {
        console.log('watcher.on.change type: ' + e.type + ' path: ' + e.path);
    });
    return watcher;
});
gulp.task('jade', ['jade:compile', 'jade:watch']);

/**** TYPESCRIPT */
var project = typescript.createProject('tsconfig.json', {
    typescript: require('typescript')
});
gulp.task('typescript:compile', function() {
    var result = project.src().pipe(typescript(project));
    return result.js
        .pipe(plumber(function(error) {
            console.log('typescript:compile error', error);
        }))
        .pipe(gulp.dest(paths.wwwroot)) // save .js
        .pipe(uglify({ preserveComments: 'license' }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.wwwroot)); // save .min.js
});
gulp.task('typescript:watch', function() {
    var watcher = gulp.watch(paths.src + matches.typescript, ['typescript:compile']);
    watcher.on('change', function(e) {
        console.log('watcher.on.change type: ' + e.type + ' path: ' + e.path);
    });
    return watcher;
});
gulp.task('typescript', ['typescript:compile', 'typescript:watch']);

/**** LESS */
gulp.task('less:compile', function() {
    console.log('less:compile COMPILING!');
    return gulp.src([paths.src + matches.less], { base: paths.src })
        .pipe(plumber(function(error) {
            console.log('less:compile error', error);
        }))
        .pipe(sourcemaps.init())
        .pipe(less().on('error', function(error) {
            console.log(error);
        }))
        /*
        .pipe(rename({
            dirname: '' // flatten directory
        }))
        */
        .pipe(gulp.dest(paths.wwwroot)) // save .css
        .pipe(cssmin())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.wwwroot)); // save .min.css
});
gulp.task('less:watch', function() {
    var watcher = gulp.watch(paths.src + matches.less, ['less:compile']);
    watcher.on('change', function(e) {
        console.log('watcher.on.change type: ' + e.type + ' path: ' + e.path);
    });
    return watcher;
});
gulp.task('less', ['less:compile', 'less:watch']);

/**** SERVE */
gulp.task('serve', function() {
    // more info on https://www.npmjs.com/package/gulp-webserver   
    var options = {
        host: 'localhost',
        port: 8000,
        directoryListing: true,
        open: true,
        middleware: [
            rewrite([
                '!\\.html|\\.js|\\.css|\\.map|\\.svg|\\.jp(e?)g|\\.png|\\.gif$ /index.html'
            ]),
            function(request, response, next) {
                // console.log('request.url', request.url);
                if (request.url !== '/hello') return next();
                response.end('<h1>Hello, world from ' + options.host + ':' + options.port + '!</h1>');
            },
        ],
        livereload: {
            enable: true, // need this set to true to enable livereload 
            filter: function(filename) {
                return !filename.match(/.map$/); // exclude all source maps from livereload
            }
        },
    };
    return gulp.src(paths.wwwroot)
        .pipe(webserver(options));
});

/**** START */
gulp.task('start', ['angular2', 'angularjs', 'less', 'jade', 'typescript', 'serve']);