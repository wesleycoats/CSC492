var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:80");

// UNIT test begin

describe("REST api Test",function(){

    // #1 should return home page

    it("should return home page",function(done){

        // calling home page api
        server
        .get("/")
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
            // HTTP status should be 200
            res.status.should.equal(200);
            // Error key should be false.
            //res.body.error.should.equal(false);
            done();
        });
    });
    
    it("testing bad user info",function(done){

        // calling home page api
        server
        .get("/userInfo")
        .expect("Content-type",/json/)
        .expect(400) // THis is HTTP response
        .end(function(err,res){
            // HTTP status should be 400
            res.status.should.equal(400);
            // Error key should be false.
            //res.body.error.should.equal(false);
            done();
        });
    });
    
    it("should add two number",function(done){

        //calling ADD api
        server
        .post('/signUp')
        .send({username : 'testname', email : 'testname@test.com', firstName : 'Test', lastName : 'Name', birthday : '06/09/1969', password : 'password'})
        .expect("Content-type",/json/)
        .expect(200)
        .end(function(err,res){
            res.status.should.equal(200);
            //res.body.error.should.equal(false);
            res.body.data.should.equal(30);
            done();
        });
    });

});