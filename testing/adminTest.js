var config = {
    url: 'http://sd-vm02.csc.ncsu.edu/#!/',
};

casper.test.begin('Testing admin', function suite(test) {
    localStorage.clear();
    test.comment('loading ' + config.url + '...');
    casper.start(config.url, function() {
        this.waitUntilVisible('a', function() {
       		test.assertTitle("ECO PRT", "ecoPRT title is the same");
            test.assertUrlMatch(config.url, 'you should be on the home page');
            casper.capture('navigation1.png');
        });
    });

    casper.then(function() {
        this.waitUntilVisible('a', function(){
        	casper.capture('navigation.png');
        	test.comment('loading...');
        	test.comment('clicking on Log In...');
        	this.clickLabel('Log In', 'a');
        	test.assertTitle("ECO PRT", "ecoPRT title is the same");
       	    test.assertUrlMatch(config.url + 'ecoPRTLogin', 'you should be on the Log in page');
       	    casper.capture('navigation2.png');
        });
        
    });
    
    casper.then(function() {
        this.wait(1000, function(){
        	casper.capture('navigation3.png');
        	this.fillXPath('form#login-form', {
        		'//input[@id="email"]': 'admin@example.com',
        		'//input[@id="password"]': 'admin'
        	}, true);
        	test.assertUrlMatch(config.url + 'ecoPRTLogin', 'you should be on the Log in page');
        	this.clickLabel('Sign In', 'button');
        	casper.capture('navigation4.png');
        });
        
    });

	casper.then(function() {
        this.wait(1000, function(){
        	casper.capture('navigation5.png');
        	test.assertUrlMatch(config.url + 'adminHome', 'you should be on the adminHome page');
        	casper.capture('img.png');
        });
        
    });
    
    casper.then(function() {
        this.waitUntilVisible('a', function(){
        	casper.capture('navigation.png');
        	test.comment('loading...');
        	test.comment('clicking on Sign Out...');
        	this.clickLabel('Sign Out', 'a');
        	test.assertTitle("ECO PRT", "ecoPRT title is the same");
       	    test.assertUrlMatch(config.url, 'you should be on the Home page');
       	    casper.capture('navigation2.png');
        });
        
    });
                  
    casper.run(function() {
           test.done();
    });
});
