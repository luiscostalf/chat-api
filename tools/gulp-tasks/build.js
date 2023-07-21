var gulp = require('gulp');
var merge = require('merge2');
var del = require('del');
var fs = require('fs');

//REQUIRE TASKS DEPENDENCIES
require('./typescript');

//CONFIGURATION
var config = require('./_config');

//CLEAN
gulp.task('clean', function () {
    return del([
        config.BUILD_PATH + '/**',
    ]);
})

//COPY FILES
gulp.task('copy-files', function () {
    return merge(
        gulp.src(['src/**/*.json'])
            .pipe(gulp.dest(config.BUILD_PATH))
    )
});

gulp.task('build', gulp.series(
    'clean',
    'typescript',
    'copy-files')
);

gulp.task('build:watch', gulp.series('build', function () {
    gulp.watch(
        ['src/**/*.ts', '!src/examples/**'],
        ['typescript']
    );
}));