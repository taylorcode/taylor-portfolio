module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        devResourcePath: 'dev',
        prodResourcePath: 'prod',

        scriptsPath: '<%= devResourcePath %>/scripts/**/*.js',
        cssPath: '<%= devResourcePath %>/assets/stylesheets/**/*.css',
        templatesPath: '<%= devResourcePath %>/templates/',

        uglify: {
            options: {
                mangle: false
            },
            prod: {
                files: {
                    '<%= prodResourcePath %>/app.min.js': ['<%= scriptsPath %>']
                }
            }
        },
        cssmin: {
            // prod
            combine: {
                files: {
                    '<%= prodResourcePath %>/app.min.css': ['<%= cssPath %>']
                }
            }
        },
        htmlbuild: {
            dev: {
                src: '<%= templatesPath %>/index.html',
                dest: 'dev/',
                options: {
                    beautify: true,
                    //prefix: '//some-cdn',
                    relative: true,
                    scripts: {
                        bundle: [
                            '<%= scriptsPath %>'
                        ]
                    },
                    styles: {
                        bundle: [
                            '<%= cssPath %>'
                        ]
                    }
                }
            },
            prod: {
                src: '<%= templatesPath %>/index.html',
                dest: 'prod/',
                options: {
                    beautify: true,
                    relative: true,
                    scripts: {
                        bundle: [
                            '<%= prodResourcePath %>/**/*.js'
                        ]
                    },
                    styles: {
                        bundle: [
                            '<%= prodResourcePath %>/**/*.css'
                        ]
                    }
                }
            }
        }
    });

    // load all tasks declared in devDependencies
    Object.keys(require('./package.json').devDependencies).forEach(function (dep) {
        if (dep.substring(0, 6) == "grunt-") {
            grunt.loadNpmTasks(dep);
        }
    });

    // setup our workflow
    grunt.registerTask('default', ['uglify', 'cssmin', 'htmlbuild']);
}