/*
 * grunt-i18n-spreadsheet
 * https://github.com/theoephraim/grunt-i18n-spreadsheet
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
      tests: ['tmp_*'],
    },

    connect: {
      server: {
        options: {
          port: 8080,
          base: "server"
        }
      }
    },
      
    // Configuration to be run (and then tested).
    i18n_spreadsheet: {
      gdocs_test_config: {
        options: {
          key_column: 'key',
          output_dir: 'tmp_gdocs',
          google_docs: {
            // this document key points to the test file -- see readme for more info
            document_key: '0Araic6gTol6SdEtwb1Badl92c2tlek45OUxJZDlyN2c'
          }
        }
      },
      http_test_config: {
        options: {
          key_column: 'key',
          output_dir: 'tmp_http',
          http: {
            url: 'http://localhost:8080/grunt-i18n-spreadsheet.csv'
          }
        }
      },
      local_test_config: {
        options: {
          key_column: 'key',
          output_dir: 'tmp_local',
          local: {
            src: 'server/grunt-i18n-spreadsheet.csv'
          }
        }
      }
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
   grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'connect', 'i18n_spreadsheet', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
