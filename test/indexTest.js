require('../index_v2');
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
    
    describe("Signup Tests",function(){
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
                //console.log(res.text)
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
                email : 'admin@example.com',
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
    });
    
    describe("Sign In Tests",function(){
        it("testing signin",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
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
    });
    
    var vehicleID
    var stationID
    var stationID2
    
    describe("Adding Tests",function(){
        
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
                    vehicleID = JSON.parse(res.text).id
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
        
        it("testing add station",function(done){
            chai.request('http://localhost:80')
        
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                var stationnum = (Math.random() * 1000)
                var coord = [(Math.random() * 1000),(Math.random() * 1000)]
                chai.request('http://localhost:80')
                .post('/addStation')
                .set('authToken', token)
                .set('content-type', 'application/json')
            
                .send({
                    name : 'station' + stationnum,
                    coordinates : [coord[0],coord[1]],
                    type: 1
                })
                .end(function(err, res) {
                    //console.log(res)
                    stationID = JSON.parse(res.text).id
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
        
        it("testing add second station",function(done){
            chai.request('http://localhost:80')
        
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                var stationnum = (Math.random() * 1000)
                var coord = [(Math.random() * 1000),(Math.random() * 1000)]
                chai.request('http://localhost:80')
                .post('/addStation')
                .set('authToken', token)
                .set('content-type', 'application/json')
            
                .send({
                    name : 'station' + stationnum,
                    coordinates : [coord[0],coord[1]],
                    type: 1
                })
                .end(function(err, res) {
                    //console.log(res)
                    stationID2 = JSON.parse(res.text).id
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
        
        it("testing add station bad account",function(done){
            chai.request('http://localhost:80')
        
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admi'
            })
            .end(function(err, res) {
                var token = res.text
                var stationnum = (Math.random() * 1000)
                var coord = [(Math.random() * 1000),(Math.random() * 1000)]
                chai.request('http://localhost:80')
                .post('/addStation')
                .set('authToken', token)
                .set('content-type', 'application/json')
            
                .send({
                    name : 'station' + stationnum,
                    coordinates : [coord[0],coord[1]],
                    type: 1
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing add station missing fields",function(done){
            chai.request('http://localhost:80')
        
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                var stationnum = (Math.random() * 1000)
                var coord = [(Math.random() * 1000),(Math.random() * 1000)]
                chai.request('http://localhost:80')
                .post('/addStation')
                .set('authToken', token)
                .set('content-type', 'application/json')
            
                .send({
                    name : 'station' + stationnum,
                    coordinates : [coord[0],coord[1]],
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing add ride",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                chai.request('http://localhost:80')
                .post('/addRide')
                .set('authToken', token)
                .send({
                    pickupNode : stationID,
                    dropoffNode : stationID2
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
        
        it("testing add ride bad account",function(done){
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
                .post('/addRide')
                .set('authToken', token)
                .send({
                    pickupNode : stationID,
                    dropoffNode : stationID2
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing add ride missing field",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                chai.request('http://localhost:80')
                .post('/addRide')
                .set('authToken', token)
                .send({
                    pickupNode : stationID,
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
    });
    
    describe("Editing Tests",function(){
    
        it("testing edit node",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                var editsobj = {
		            name : "newname",
	            }
                chai.request('http://localhost:80')
                .post('/editNode')
                .set('authToken', token)
                .send({
                    id : stationID,
                    edits : editsobj
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
        
        it("testing edit node bad account",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admi'
            })
            .end(function(err, res) {
                var token = res.text
                var editsobj = {
		            name : "newname",
	            }
                chai.request('http://localhost:80')
                .post('/editNode')
                .set('authToken', token)
                .send({
                    id : stationID,
                    edits : editsobj
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing edit node missing field",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                var editsobj = {
		            name : "newname",
	            }
                chai.request('http://localhost:80')
                .post('/editNode')
                .set('authToken', token)
                .send({
                    edits : editsobj
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing edit vehicle",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                var editsobj = {
		            name : "newname",
	            }
                chai.request('http://localhost:80')
                .post('/editVehicle')
                .set('authToken', token)
                .send({
                    id : vehicleID,
                    edits : editsobj
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
        
        it("testing edit vehicle bad account",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admi'
            })
            .end(function(err, res) {
                var token = res.text
                var editsobj = {
		            name : "newname",
	            }
                chai.request('http://localhost:80')
                .post('/editVehicle')
                .set('authToken', token)
                .send({
                    id : vehicleID,
                    edits : editsobj
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing edit vehicle missing field",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                var editsobj = {
		            name : "newname",
	            }
                chai.request('http://localhost:80')
                .post('/editVehicle')
                .set('authToken', token)
                .send({
                    edits : editsobj
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
    
    });
    
    describe("Deleting Tests",function(){
        it("testing delete node missing field",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                chai.request('http://localhost:80')
                .post('/deleteNode')
                .set('authToken', token)
                .send({
                    id: ''
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing delete node bad account",function(done){
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
                .post('/deleteNode')
                .set('authToken', token)
                .send({
                    id: stationID
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing delete node",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                chai.request('http://localhost:80')
                .post('/deleteNode')
                .set('authToken', token)
                .send({
                    id: stationID
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
        
        it("testing delete second node",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                chai.request('http://localhost:80')
                .post('/deleteNode')
                .set('authToken', token)
                .send({
                    id: stationID2
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
        
        it("testing delete vehicle missing field",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                chai.request('http://localhost:80')
                .post('/deleteVehicle')
                .set('authToken', token)
                .send({
                    id: ''
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing delete vehicle bad account",function(done){
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
                .post('/deleteNode')
                .set('authToken', token)
                .send({
                    id: vehicleID
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(400);
                    done();
                });
            });
        });
        
        it("testing delete vehicle",function(done){
            chai.request('http://localhost:80')
            .post('/signIn')
            .type('form')
            .send({
                email : 'admin@example.com',
                password : 'admin'
            })
            .end(function(err, res) {
                var token = res.text
                chai.request('http://localhost:80')
                .post('/deleteNode')
                .set('authToken', token)
                .send({
                    id: vehicleID
                })
                .end(function(err, res) {
                    //console.log(res)
                    expect(res).to.have.status(200);
                    done();
                });
            });
        });
    });
});