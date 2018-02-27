# 2018SpringTeam14

## EcoPRT


### Installation Guide

#### Download

* Node.js 8.9.4
  * For Windows/Mac
    * https://nodejs.org/en/
    * Download the one that says “recommended for most user”
  * For Linux
    * https://nodejs.org/en/download/package-manager/
* MongoDB 3.6.3
  * For Windows/Mac
    * https://www.mongodb.com/download-center#community
    * Click the Community Server tab
    * In this tab,click the tab for you specific OS
    * Download the program
  * For Linux
    * https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
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
* Terminal should say waiting for connection
   
Add Test Data:
* Open another terminal
* cd to where Github repo is
* cd to mongo folder
* Run "npm install"
* Run "node mongoSetup.js"
* Close this terminal

#### Running Website
* Make sure MongoDB is running
* Open a terminal
* cd to where Github repo is
* Run "npm install"
* Run "node index.js"
* In a web browser, go to localhost:3000/home.html

#### Terminating System
* Close web browser or tab that has the website running
* Go to terminal where you ran “mongod” and enter ctrl-C to close the database
* Go to terminal where you ran “node index.js” and enter ctrl-C to close the connection

