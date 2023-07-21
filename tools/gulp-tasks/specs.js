const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
var SpecReporter = require('jasmine-spec-reporter');
const path = require("path");
const config = require("./_config");

const SPEC_FILES = [
    path.join(config.BUILD_PATH, "**/*[sS]pec.js")
];

gulp.task('test', () =>
    gulp.src(SPEC_FILES)
        // gulp-jasmine works on filepaths so you can't have any plugins before it 
        .pipe(jasmine({
            includeStackTrace: true
        }))
);

gulp.task('test:spec', () =>
    gulp.src(SPEC_FILES)
        // gulp-jasmine works on filepaths so you can't have any plugins before it 
        .pipe(jasmine({
            reporter: new SpecReporter()
        }))
);