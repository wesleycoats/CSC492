var casper = require('casper').create();

casper.start('http://sd-vm02.csc.ncsu.edu/#!/', function() {
             this.echo(this.getTitle());
             });

casper.thenOpen('http://phantomjs.org', function() {
                this.echo(this.getTitle());
                });

casper.run();
