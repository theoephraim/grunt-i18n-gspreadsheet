/*
 * grunt-i18n-gspreadsheet
 * https://github.com/theoephraim/grunt-i18n-gspreadsheet
 *
 * Copyright (c) 2013 Theo Ephraim
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    i18n_gspreadsheet: {
      custom_options: {
        options: {
          output_dir: 'tmp',
          // this document key points to a test file -- https://docs.google.com/spreadsheet/ccc?key=0Araic6gTol6SdEtwb1Badl92c2tlek45OUxJZDlyN2c#gid=0
          // it is public readable only.
          document_key: '0Araic6gTol6SdEtwb1Badl92c2tlek45OUxJZDlyN2c'
        }
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'i18n_gspreadsheet', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
