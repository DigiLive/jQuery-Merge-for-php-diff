module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)
  grunt.loadTasks 'tasks'


  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    meta:
      banner: """/*!
                  * <%= pkg.name %> - <%= pkg.description %>
                  * v<%= pkg.version %> - <%= grunt.template.today("UTC:yyyy-mm-dd h:MM:ss TT Z") %>
                  * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; License: <%= pkg.license %>
                  */

              """
      minbanner: """/*!
                  * <%= pkg.name %> v<%= pkg.version %> - Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> - License: <%= pkg.license %>
                  */
              """

    less:
      dist:
        files:
          'dist/<%= pkg.compactname %>.css': ['src/phpdiffmerge.less']

    cssmin:
      options:
         banner: '<%= meta.minbanner %>'
      styles:
        files:
          'dist/<%= pkg.compactname %>.min.css': ['dist/<%= pkg.compactname %>.css']

    concat:
      options:
        stripBanners: true
        banner: '<%= meta.banner %>'
      dist:
        src: ['src/phpdiffmerge.js']
        dest: 'dist/<%= pkg.compactname %>.js'
      styles:
        src: ['dist/<%= pkg.compactname %>.css']
        dest: 'dist/<%= pkg.compactname %>.css'

    uglify:
      options:
         banner: '<%= meta.minbanner %>\n'
      dist:
        files:
          'dist/<%= pkg.compactname %>.min.js': ['dist/<%= pkg.compactname %>.js']

    karma:
      options:
        configFile: 'karma.conf.coffee'

      single:
        singleRun: true

      watch:
        singleRun: false
        autoWatch: true

    bump:
      options:
        files: ['package.json', 'bower.json']
        updateConfigs: ['pkg']
        commitFiles: ['package.json', 'bower.json', 'dist/']
        tagName: 'v%VERSION%'
        pushTo: 'origin'


  grunt.registerTask 'test', ['karma:single']
  grunt.registerTask 'watch', ['karma:watch']
  grunt.registerTask 'build', ['less', 'cssmin', 'concat', 'uglify']
  grunt.registerTask 'default', ['test', 'build']
  grunt.registerTask 'release', (type) -> grunt.task.run ['test', "bump-only:#{type||'patch'}", 'build', 'bump-commit']
