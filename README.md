# 2018SpringTeam14

## EcoPRT


### User Guide

#### Download

* Node.js 8.9.4 (https://nodejs.org/en/) 
* MongoDB 3.6.3 (https://www.mongodb.com/download-center#community)
* Github Repository

#### MongoDB Setup

Running MongoDB:
* For Linux/Mac
  * Enter "mongod" in a terminal to run MongoDB
* For Windows
   * Add MongoDB to path variable
   * Add a folder called "data" to your C: drive
   * Add a folder called "db" inside the "data" folder
   * Open a terminal and enter "mongod"
   
Add Test Data:
* Open another terminal
* cd to where Github repo is
* cd to mongo folder
* Run "npm install"
* Run "node mongoSetup.js"

#### Run Website
* cd to where Github repo is
* Run "npm install"
* Run "node index.js"
* In a web browswer, go to localhost:3000/home.html
