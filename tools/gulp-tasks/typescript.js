
var config = require('./_config');
const TSCONFIG = '../../tsconfig.json'
var tsconfig = require(TSCONFIG).compilerOptions;
const gulp = require('gulp');
const ts = require('gulp-typescript');

// Initialize TypeScript project
const tsProject = ts.createProject('tsconfig.json');

// Build task
gulp.task('typescript', function () {
    return gulp.src([
        'src/**/*.ts',
        '!src/examples/**',
        'typings/**/*.ts',
        'node_modules/inversify-dts/inversify/**/*.ts',
        '*.ts'
    ]) // Change the source directory according to your project structure
        .pipe(tsProject())
        .pipe(gulp.dest(config.BUILD_PATH)); // Change the destination directory according to your project structure
});

// Watch task
gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', gulp.series('typescript'));
});

// Default task
gulp.task('default', gulp.series('typescript', 'watch'));