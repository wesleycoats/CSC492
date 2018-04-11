var chai = require('chai')
  , chaiHttp = require('chai-http');

chai.use(chaiHttp);
var expect = chai.expect;

describe("REST api Test",function(){

    it("should return home page",function(done){
        chai.request('http://localhost:80')
        .get('/')
        .end(function(err, res) {
            expect(res).to.have.status(200);
            done();
        });
    });
    
    it("testing signup form",function(done){
        var emailnum = (Math.random() * 1000)
        chai.request('http://localhost:80')
        .post('/signUp')
        .type('form')
        .send({
            username : 'testname',
            email : 'testname'+ emailnum + '@test.com',
            firstName : 'Test',
            lastName : 'Name',
            birthday : '06/09/1969',
            password : 'password'
        })
        .end(function(err, res) {
            expect(res).to.have.status(200);
            done();
        });
    });
    
    it("testing signup form bad email",function(done){
        chai.request('http://localhost:80')
        .post('/signUp')
        .type('form')
        .send({
            username : 'testname',
            email : 'testname@test.com',
            firstName : 'Test',
            lastName : 'Name',
            birthday : '06/09/1969',
            password : 'password'
        })
        .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });
    
    it("testing signup form missing field",function(done){
        chai.request('http://localhost:80')
        .post('/signUp')
        .type('form')
        .send({
            username : '',
            email : 'testname@test.com',
            firstName : 'Test',
            lastName : 'Name',
            birthday : '06/09/1969',
            password : 'password'
        })
        .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });

    it("testing signin",function(done){
        chai.request('http://localhost:80')
        .post('/signIn')
        .type('form')
        .send({
            email : 'testname@test.com',
            password : 'password'
        })
        .end(function(err, res) {
            expect(res).to.have.status(200);
            done();
        });
    });
    
    it("testing signin wrong password",function(done){
        chai.request('http://localhost:80')
        .post('/signIn')
        .type('form')
        .send({
            email : 'testname@test.com',
            password : 'wrongpassword'
        })
        .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });
    
    it("testing signin no user",function(done){
        chai.request('http://localhost:80')
        .post('/signIn')
        .type('form')
        .send({
            email : 'doesntexist@doesntexist.doesntexist',
            password : 'wrongpassword'
        })
        .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });
    
    it("testing signin missing field",function(done){
        chai.request('http://localhost:80')
        .post('/signIn')
        .type('form')
        .send({
            email : '',
            password : 'wrongpassword'
        })
        .end(function(err, res) {
            expect(res).to.have.status(400);
            done();
        });
    });
    
    it("testing add vehicle",function(done){
        chai.request('http://localhost:80')
        
        .post('/signIn')
        .type('form')
        .send({
            email : 'admin@example.com',
            password : 'admin'
        })
        .end(function(err, res) {
            var token = res.text
            var vehiclenum = (Math.random() * 1000)
            chai.request('http://localhost:80')
            .post('/addvehicle')
            .type('form')
            .set('authToken', token)
            
            .send({
                name : 'vehicle' + vehiclenum
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                done();
            });
        });
    });

    it("testing add vehicle bad account",function(done){
        chai.request('http://localhost:80')
        .post('/signIn')
        .type('form')
        .send({
            email : 'admin@example.com',
            password : 'admi'
        })
        .end(function(err, res) {
            var token = res.text
            chai.request('http://localhost:80')
            .post('/addvehicle')
            .type('form')
            .set('authToken', token)
            .send({
                name : 'vehicle',
            })
            .end(function(err, res) {
                expect(res).to.have.status(400);
                done();
            });
        });
    });
    
});