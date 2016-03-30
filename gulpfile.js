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

var excludes = {
    less: '/**/_*.less',
    js: '/**/*.min.js',
}

var names = {
    vendors: '/vendors.js',
}

paths.vendors = paths.wwwroot + folders.js + folders.vendors;

/**** VENDORS */
gulp.task('vendors:clean', function() {
    return new Promise(function (resolve, reject) {
		var v = vinyl();
        gulp.src(paths.vendors + matches.everything)
        .pipe(plumber(function(error) {
            console.log('vendors:clean.plumber', error);
            reject();
        }))
        .pipe(v)    
        .on('end', function () {
            del(v.paths).then(function() {
                console.log('vendors:cleaned', v.paths);
                resolve();
            }).catch(function(){
                console.log('vendors:clean.error', v.paths);
                reject();
            })
        });
	});
    /*
    return gulp.src(paths.vendors + matches.everything)
        .pipe(plumber(function(error) {
            console.log('vendors:clean error', error);
        }))
        .pipe(vinyl(del));
        */
    // return del([paths.vendors + matches.everything]);    
});

/**** ANGULARJS */
var angularjs = {
    src: [ // important!! keep loading order for bundle
        paths.bower + '/angular/angular.js',
        paths.bower + '/angular-route/angular-route.js',
        paths.bower + '/angular-animate/angular-animate.js',
    ]
}
gulp.task('vendors:angularjs', ['vendors:clean'], function() {
    return gulp.src(angularjs.src, { base: '.' })
        .pipe(plumber(function(error) {
            console.log('angularjs:compile.plumber', error);
        }))
        .pipe(rename({
            dirname: '', // flatten directory
        }))
        .pipe(gulp.dest(paths.vendors)) // save files
        .pipe(concat(paths.vendors + names.vendors))
        .pipe(gulp.dest('.')) // save .js
        .pipe(sourcemaps.init())
        .pipe(uglify()) // { preserveComments: 'license' }
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('.')) // save .min.js
        .pipe(sourcemaps.write('.')); // save .map       
});

gulp.task('angularjs', ['vendors:clean', 'vendors:angularjs'], function(done) { done(); });

/**** ANGULAR2 */
var angular2 = {
    src: [ // important!! keep loading order for bundle
        paths.node + '/es6-shim/es6-shim.js',
        paths.node + '/angular2/es6/dev/src/testing/shims_for_IE.js',
        paths.node + '/systemjs/dist/system-polyfills.js',
        paths.node + '/angular2/bundles/angular2-polyfills.js',
        paths.node + '/systemjs/dist/system.js',
        paths.node + '/rxjs/bundles/Rx.js',
        paths.node + '/angular2/bundles/angular2.dev.js',
        paths.node + '/angular2/bundles/http.dev.js',
        paths.node + '/angular2/bundles/router.dev.js',        
    ]
}
gulp.task('vendors:angular2', ['vendors:clean'], function() {
    return gulp.src(angular2.src, { base: '.' })
        .pipe(plumber(function(error) {
            console.log('angular2:compile.plumber', error);
        }))
        .pipe(rename({
            dirname: '', // flatten directory
        }))        
        .pipe(gulp.dest(paths.vendors)) // save files
        .pipe(concat(paths.vendors + names.vendors))
        .pipe(gulp.dest('.')) // save .js
        .pipe(sourcemaps.init())
        .pipe(uglify()) // { preserveComments: 'license' }
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('.')) // save .min.js
        .pipe(sourcemaps.write('.')); // save .map        
});
gulp.task('angular2', ['vendors:clean', 'vendors:angular2'], function(done) { done(); });

/**** JADE */
gulp.task('jade:compile', function() {
    var options = {
        locals: {},
        pretty: true,
    };
    return gulp.src(paths.src + matches.jade)
        .pipe(plumber(function(error) {
            console.log('jade:compile.plumber', error);
        }))
        .pipe(jade(options))
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
            console.log('typescript:compile.plumber', error);
        }))
        .pipe(gulp.dest(paths.wwwroot)) // save .js
        .pipe(sourcemaps.init())
        .pipe(uglify({ preserveComments: 'license' }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(paths.wwwroot)) // save .min.js
        .pipe(sourcemaps.write('.')); // save .map        
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
    return gulp.src([
            paths.src + matches.less,
            '!' + paths.src + excludes.less,
        ], { base: paths.src })
        .pipe(plumber(function(error) {
            console.log('less:compile.plumber', error);
        }))
        .pipe(less().on('less:compile.error', function(error) {
            console.log(error);
        }))
        .pipe(gulp.dest(paths.wwwroot)) // save .css
        .pipe(sourcemaps.init())
        .pipe(cssmin())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(paths.wwwroot)) // save .min.css
        .pipe(sourcemaps.write('.')); // save .map        
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
gulp.task('serve', ['typescript:compile', 'less:compile', 'jade:compile'], function() {
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
// angular2 startup task
gulp.task('start', [
    'vendors:clean', 'vendors:angular2', 
    'typescript:compile', 'less:compile', 'jade:compile', 
    'serve', 
    'typescript:watch', 'less:watch', 'jade:watch'
]);
// angularjs startup task 
/*
gulp.task('start', [
    'vendors:clean', 'vendors:angularjs', 
    'typescript:compile', 'less:compile', 'jade:compile', 
    'serve', 
    'typescript:watch', 'less:watch', 'jade:watch'
]);
*/