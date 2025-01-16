
Steps to Setup the Project - 

1) download and setup node js and env variables.. refer youtube videos
2) download and setup git and env variables.. refer youtube videos
3) install mongodb for desktop localhost, mongosh and download mongodb compass and install it

1) Download the Project
Clone from github using command - git clone https://github.com/Nexolve-Technologies-India/Airlift-College-Project.git OR Extract Zip File
2) open cmd prompt and run code: mongod --port 8848
3) open another cmd prompt and run  code: mongosh --port 8848
4) after mongod db server is started, open the extracted project in visual studio code
5) open powershell terminal and enter command "cd backend" in terminal to open backend folder
6) enter command "npm install" to install dependencies
7) after dependencies are installed, enter command "npm run dev". the terminal should say server started on port 5500 and mongodb connected
8) then open another powershell terminal in the root directory of project and run "npm install" again to install frontend dependencies
9) after dependencies are installed, run command "npm run dev".. server will start at URL: localhost:3000 or localhost:5173. open the url in browser to view the project.
10) now open another power shell terminal, and enter commands "cd backend" then cd "database" and run command -  npx ts-node datascript.ts

11) Project setup will be completed and you can test the application now
   





