module.exports = function (grunt) {

    var log = function (err, stdout, stderr, cb) {
        if(stdout) {
            grunt.log.writeln(stdout);
        }
        if(stderr) {
            grunt.log.error(stderr);
        }
        cb();
    };

    grunt.initConfig({
        shell: {
            jekyllClean: {
                command: 'jekyll clean',
                options: {
                    callback: log
                }
            },
            jekyllBuild: {
                command: 'jekyll build --draft --incremental JEKYLL_ENV=dev',
                options: {
                    callback: log
                }
            }
        },
        watch: {
            posts:{
                files:[
                    '_config.yml',
                    '*.html',
                    '*.md',
                    '_layouts/**',
                    '_posts/**',
                    '_drafts/**',
                    '_includes/**',
                    'assets/**/*.*',
                    '_sass/**/*.*',
                    'css/**/*.*'
                ],
                tasks: ['shell:jekyllBuild']
            }
        },
        browserSync: {
            dev: {
                bsFiles: {
                    src : [
                        '_site/**/*.*'
                    ]
                },
                options: {
                    watchTask: true,
                    server: './_site'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.registerTask('build',['shell:jekyllBuild']);
    grunt.registerTask('default', ['build', 'browserSync', 'watch']);
    grunt.registerTask('clean',['shell:jekyllClean']);
};