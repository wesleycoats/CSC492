var config = {
    url: 'http://sd-vm02.csc.ncsu.edu/#!/',
};

casper.test.begin('Testing admin', function suite(test) {
    localStorage.clear();
    test.comment('loading ' + config.url + '...');
    
    casper.start(config.url, function() {
        this.waitForResource(config.url, function() {
       		casper.capture('test/casperTest/img/1.png');
       		test.assertTitle("ECO PRT", "ecoPRT title is the same");
            test.assertUrlMatch(config.url, 'you should be on the home page');
        });
    });

	casper.then(function() {
    	this.waitForResource(config.url, function(){
    		test.comment('loading...');
       	    test.comment('clicking on Log In...');
       	    this.clickLabel('Sign Out', 'a');
        	this.clickLabel('Log In', 'a');
        	test.assertTitle("ECO PRT", "ecoPRT title is the same");
       		test.assertUrlMatch(config.url + 'ecoPRTLogin', 'you should be on the Log in page');
       		casper.capture('test/casperTest/img/2.png');
       	});
       	
    });


    casper.then(function() {
		casper.capture('test/casperTest/img/3.png');
       	    this.wait(5000, function(){
        	    casper.capture('test/casperTest/img/4.png');
          	    this.fillXPath('form#login-form', {
        		    '//input[@id="email"]': 'admin@example.com',
        		    '//input[@id="password"]': 'admin'
        	    }, true);
        	    test.assertUrlMatch(config.url + 'ecoPRTLogin', 'you should be on the Log in page');
        	    this.clickLabel('Sign In', 'button');
        	    casper.capture('test/casperTest/img/5.png');
            });
    });


	casper.then(function() {
        this.wait(1000, function(){
        	casper.capture('test/casperTest/img/admin.png');
        	test.assertUrlMatch(config.url + 'adminHome', 'you should be on the adminHome page');
        	casper.capture('test/casperTest/img/7.png');
        });
        
    });
    
    casper.then(function() {
        this.waitUntilVisible('a', function(){
        	casper.capture('test/casperTest/img/home.png');
        	test.comment('loading...');
        	test.comment('clicking on Sign Out...');
        	this.clickLabel('Sign Out', 'a');
        	test.assertTitle("ECO PRT", "ecoPRT title is the same");
       	    test.assertUrlMatch(config.url, 'you should be on the Home page');
       	    casper.capture('test/casperTest/img/mohe2.png');
        });
        
    });
                  
    casper.run(function() {
           test.done();
    });
});
