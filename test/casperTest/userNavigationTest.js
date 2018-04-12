var config = {
    url: 'http://sd-vm02.csc.ncsu.edu/#!/',
};

casper.test.begin('Testing user navigation', function suite(test) {
    localStorage.clear();
    test.comment('loading ' + config.url + '...');
    casper.start(config.url, function() {
        test.assertTitle("ECO PRT", "ecoPRT title is the same");
        test.assertUrlMatch(config.url, 'you should be on the home page');
        
                  
    });

    casper.then(function() {
        this.waitUntilVisible('a', function(){
        	casper.capture('test/casperTest/img/navigation.png');
        	test.comment('loading...');
        	test.comment('clicking on Log In...');
        	this.clickLabel('Log In', 'a');
        	test.assertTitle("ECO PRT", "ecoPRT title is the same");
       	    test.assertUrlMatch(config.url + 'ecoPRTLogin', 'you should be on the Log in page');
       	    casper.capture('test/casperTest/img/navigation.png');
        });
        
    });
    
    casper.then(function() {
        this.waitUntilVisible('a', function(){
        	casper.capture('test/casperTest/img/navigation.png');
        	test.comment('loading...');
        	test.comment('clicking on Home...');
        	this.clickLabel('Home', 'a');
        	test.assertTitle("ECO PRT", "ecoPRT title is the same");
       	    test.assertUrlMatch(config.url, 'you should be on the Home page');
       	    casper.capture('test/casperTest/img/navigation.png');
        });
        
    });
    
    casper.then(function() {
        this.waitUntilVisible('a', function(){
        	casper.capture('test/casperTest/img/1navigation.png');
        	test.comment('loading...');
        	test.comment('clicking on Sign Up...');
        	this.clickLabel('Sign Out', 'a');
        	this.clickLabel('Sign Up', 'a');
        	this.waitUntilVisible('a', function() {
        	
        	casper.capture('test/casperTest/img/2navigation.png');
        	test.assertTitle("ECO PRT", "ecoPRT title is the same");
       	    test.assertUrlMatch(config.url + 'ecoPRTSignUp', 'you should be on the SignUp  page');
       	    casper.capture('test/casperTest/img/3navigation.png');
       	    });
        });
        
    });
    
    casper.then(function() {
        this.waitUntilVisible('a', function(){
        	casper.capture('test/casperTest/img/navigation.png');
        	test.comment('loading...');
        	test.comment('clicking on EcoPRT...');
        	this.clickLabel('EcoPRT', 'a');
        	test.assertTitle("ECO PRT", "ecoPRT title is the same");
       	    test.assertUrlMatch(config.url, 'you should be on the Home page');
       	    casper.capture('test/casperTest/img/navigation.png');
        });
        
    });
                  
    casper.run(function() {
           test.done();
    });
});
