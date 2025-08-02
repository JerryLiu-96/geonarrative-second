# Creating Your Participatory Geonarrative: A Tutorial Based on South Beach, Washington

Ziyang Liu | Urban Design and Planning | University of Washington
## Highlights
This tutorial walks you through steps to create a geospatial application for participatory mapping, and is a fit for you if you are interested in learning:
- Geospatial visualization and participatory mapping;
- **Full-stack** Geospatial web application development;
- How to use **Mapbox GL JS** to create a web mapping;
- How to use **Tailwind CSS** to style web applications;
- How to use **Node.js** for back-end development;
- How to use **PostgreSQL** and **PostGIS** for database management;
- How to use **Amazon S3** to save large objects;
- Deploying web applications to **Heroku**
- Keeping sensitive information, e.g., credentials and tokens, in a secured way;
- Building a participatory geonarrative to share place-based knowledge
## 1. Introduction

This participatory geonarrative is a full-stack web application that allows participants to share their place-based knowledge with multiple media formats related to the South Beach area. Though no need to be an expert, to follow this tutorial, you should have (or be willing to learn) the following skills and knowledge:
- A basic knowledge of front-end technologies: HTML, CSS, JavaScript
  - This tutorial uses [Tailwind CSS](https://tailwindcss.com/) for styling. Tailwind CSS scans your HTML files and generates the CSS styles you need, so you don't have to write CSS styles yourself.
- A basic knowledge of back-end technologies: Node.js and the PostgreSQL database
- Some experience with web mapping with Mapbox GL JS, and
- Accounts on Github and Heroku.

### Installing Dependencies

If you are new to these topics, or if you don't have the required dependencies installed, please follow these resources below to set up your development environment.
- [Node.js](https://nodejs.org/en/): download and install the Node.js
- [PostgreSQL](https://neon.com/postgresql/postgresql-getting-started): Heroku provides a PostgreSQL database, and we will use Heroku's on-cloud database for our product. I recommend you to also install PostgreSQL in our local environment. It is a good practice to separate database for product and for development, and I will use local database for development.
  - [Postgres.app](https://postgresapp.com/): The developer of this tutorial uses Postgres.app on Mac, which is a simple way to install PostgreSQL on macOS.
  - [pgAdmin 4](https://www.pgadmin.org/download/): is a popular, open-source, web-based graphical user interface (GUI) tool used for managing and developing PostgreSQL databases.
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/): Mapbox GL JS is a JavaScript library for interactive maps.
- [Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs): Heroku is a cloud platform as a service (PaaS) that enables developers to build, deploy, and manage applications and services.
- [Amazon S3](https://aws.amazon.com/s3/): Amazon Simple Storage Service (Amazon S3) is an object storage service offering industry-leading scalability, data availability, security, and performance. I use Amazon S3 in this project for two reasons:
  - Storing large binary files (like images) in a database is an "anti-pattern" that leads to significant problems as your application grows. Therefore, I will save images in Amazon S3 and save URLs to images in PostGreSQL.
  - Heroku's ephemeral filesystem will delete saved files when dyno restarts.

## 2. Fork the Repository
This tutorial will walk you through the whole process of creating the participatory geonarrative. But you can also skip the tutorial and directly use the code in this repository. To do so, you need to fork this repository to your own GitHub account. In GitHub, forking a repository creates a personal copy of someone else's project in your own account, allowing you to experiment with changes or contribute to the original project without directly modifying it.

1. Open your web browser and go to [GitHub](https://github.com). In the top-right corner of the page, you'll see two options: Sign in and Sign up. If you have an account already, click Sign in. If you don't, click Sign up and follow the instructions to create a new account.
2. Once you're signed in, navigate to the repository you want to fork. In this case, it's the [Participatory Geonarrative Repository](https://github.com/JerryLiu-96/geonarrative-second)
3. Fork the repository by clicking the "Fork" button in the top-right corner of the page. This will create a copy of the repository in your own GitHub account.
4. After forking, you will be redirected to your new repository. You can rename it if you want, but it's not necessary. The repository will have the same files and structure as the original one.
5. (Optional) Clone the forked repository to your local machine. You can do this by clicking the green "Code" button on your repository page, copying the URL, and running the following command in your terminal:
   ```bash
   git clone <your-forked-repo-url>
   ```

## 3. Understanding the system mechanism
To know how to create this participatory geonarrative, it is important to understand the repository structure and the system workflow.

### 3.1 Repository Structure
The repository is structured to separate the web client and the web server. The web client is a static web application that runs in the browser, while the web server is a Node.js application that handles requests from the web client, interacts with the PostgreSQL database, and serves the static files of the web client. The repository structure is as follows:

```bash
├── README.md                    // project instruction
├── public                         // the web client
│   ├── index.html              // the main HTML file
│   ├── ...                          // other static files
├── tailwind                          // tailwind CSS
│   ├── node_modules                 // tailwind CSS dependencies
│   ├── tailwind.config.js       // tailwind CSS configuration file
│   ├── input.css
│   ├── package.json                 // the configuration file (automatically generated)
│   ├── package-lock.json            // the configuration file (automatically generated)
├── node_modules                 // server-side dependencies
│   ├── ...
├── index.js                    // the main server file
├── package.json                 // the configuration file
├── database.sql                 // the database schema
├── package.json                 // the config file (automatically generated)
├── package-lock.json            // the config file (automatically generated)
├── PROCFILE                     // the config file for Heroku
```

- The `public` directory contains the static files of the web client, including the main HTML file, CSS files, and JavaScript files. As you will find out later, only the `public` folder is sent to the browser. All other files are kept on the server. It is an industry standard to separate the web client and the web server.
- The `tailwind` directory contains the Tailwind CSS configuration and dependencies. Tailwind CSS CLI is installed via npm, and the `node_modules` directory contains all the dependencies required by Tailwind CSS.
  - Note the difference between the `node_modules` directory in the `tailwind` folder and the `node_modules` directory in the root folder. The former is for Tailwind and CSS build tools, while the latter is for the server.
- The `index.js` file is the main server file that handles requests from the web client.
- The `package.json` file in the root is the configuration file for the Node.js application. It contains information about the project, such as its name, version, dependencies, and scripts.
- The `package-lock.json` file in the root is automatically generated by npm and contains the exact versions of the dependencies installed in the project.

### 3.2 System Workflow
The system workflow is as follows:
1. The web client is a static web application that runs in the browser. It is built using HTML, CSS, and JavaScript. The web client is responsible for displaying the interactive maps and allowing users to interact with the maps.
2. The web server is a Node.js application that handles requests from the web client. It serves the static files of the web client and provides APIs for the web client to interact with the PostgreSQL database.
3. The PostgreSQL database is used to store the place-based stories contributed by users. The database schema is defined in the `database.sql` file, which is executed to create the necessary tables in the database.
4. The web server uses the `pg` module to connect to the PostgreSQL database and execute SQL queries. The server handles requests from the web client, such as saving a place-based story or retrieving stories from the database.

## 4. Creating the Participatory Geonarrative
This is the core of this tutorial. In this section, we will walk through the process of creating the participatory geonarrative.

### 4.1 Setting Up the Web Client
The web client is a static web application that runs in the browser.
- Create a new directory called `public` in the root of your project. This directory will contain all the static files of the web client.
- Inside the `public` directory, create an `index.html` file. This file will be the main HTML file of the web client.

### 4.2 Setting Up the Tailwind CSS
Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without writing custom CSS styles.
- Create a new directory called `tailwind` in the root of your project. This directory will contain all the Tailwind CSS files and dependencies.
- In the `tailwind` directory, create a `tailwind.config.js` file. Though according to the Tailwind v4 documentation, this file is notrequired, we still create it because I encountered some issues with the Tailwind CLI when I did not create this file. Incluse a config file solves the issue.
  ```javascript
  module.exports = {
    content: [
      "../public/**/*.html",
      "../public/**/*.js"
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  ```

- In the terminal, navigate to the `tailwind` directory and run the following command to initialize a new Node.js project:
  ```bash
  npm init -y
  ```
This command creates a `package.json` file in the `tailwind` directory, which is the configuration file for the Node.js application. It contains information about the project, such as its name, version, dependencies, and scripts.
- Install Tailwind CSS and its dependencies by running the following command:
  ```bash
  npm install tailwindcss postcss @tailwindcss/cli
  ```
  amend the `package.json` file in the `tailwind` directory to include the following scripts:
  ```json
    {
      "name": "tailwind",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "dev": "tailwindcss -i ./input.css -o ../public/css/output.css --watch",
        "build": "tailwindcss -i ./input.css -o ../public/css/output.css --minify"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "@tailwindcss/cli": "^4.1.10",
        "tailwindcss": "^4.1.10"
      }
    }
  ```
  - The `dev` script is used to start the Tailwind CSS development server, which watches for changes in the `input.css` file and generates the `output.css` file in the `public/css` directory.
  - The `build` script is used to build the production version of the Tailwind CSS styles, which minifies the `output.css` file.
- In the`tailwind` directory, create a file named `input.css`. This file will contain the Tailwind CSS directives. Add the following content to the `input.css` file:
  ```css
  @import "tailwindcss";
  @source inline("{focus:,}ring-{red,blue,green,purple,orange,teal,yellow}-300");
  @source inline("{peer-focus:,}text-{red,blue,green,purple,orange,teal,yellow}-500");
  @source inline("{focus-within:,}ring-{red,blue,green,purple,orange,teal,yellow}-500");
  @source inline("from-{red,blue,green,purple,orange,teal,yellow}-100 to-{red,blue,green,purple,orange,teal,yellow}-500 {hover:,}bg-{red,blue,green,purple,orange,teal,yellow}-500");
  @config "./tailwind.config.js";
  ```
  > Tailwind CSS should auto-detect utility classes. In case it does not work, the `@source inline` directive is used to include utility classes that are not included by default in Tailwind CSS. Whenever you find an utility class that does not show up in `public/css/output.css`, you can include that in the `@source inline` directive. The `@config` directive is used to specify the configuration file for Tailwind CSS.

- Start the Tailwind CSS development server by running the following command in the `tailwind` directory in terminal:
  ```bash
  npm run dev
  ```
  `npm run dev` will find the `package.json` in its directory and run the `dev`, which is `tailwindcss -i ./input.css -o ../public/css/output.css --watch`. This equates to running `npx tailwindcss -i ./input.css -o ../public/css/output.css --watch` in the terminal. The `-i` option specifies the input file, and the `-o` option specifies the output file. The `--watch` option tells Tailwind CSS to watch for changes in the input file and regenerate the output file automatically.
    - You should run this `dev` each time you work on the project.
    - Before deploying the project to Heroku, you may run `build` script to generate the production version of the Tailwind CSS styles. This will minify the `output.css` file and remove any unused styles.
- In the `public` directory, create a new directory called `css`. This directory will contain the generated Tailwind CSS styles in `output.css`.
- Start using Tailwind CSS in your HTML files. In the `public/index.html` file, include the generated `output.css` file in the `<head>` section:
  ```html
  <link href="css/output.css" rel="stylesheet">
  ```

### 4.3 Setting Up the Web Server
The web server is a Node.js application that handles requests from the web client, serves the static files of the web client, and provides APIs for the web client to interact with the PostgreSQL database.
- In the root directory of your project, create a file named `index.js`. This file will be the main server file.
- Also in the root directory, create a `.env` file. This file contains URL to your local PostgreSQL database, which is used for development purposes. The `.env` file should contain the following:
  ```plaintext
  DATABASE_URL=postgres://username:password@localhost:5432/database_name
  ```
  Replace `username`, `password`, and `database_name` with your PostgreSQL database credentials.
  > (Optional) You may also want to keep your Mapbox GL JS access token in the `.env` file. If you do so, add the following line to the `.env` file:
    ```plaintext
    MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
    ```
- Since the database credentials are sensitive information, you should not commit the `.env` file to your GitHub repository. This is why you cannot find a `.env` file in my repository. To do so, create a `.gitignore` file in the root directory of your project and add the following line to it:
  ```plaintext
  .env
  ```
- In terminal, navigate to the root directory of your project and run the following command to initialize a new Node.js project:
  ```bash
  npm init -y
  ```
  This creates a `package.json` file in the root directory, which is the configuration file for the `Node.js` application.
- Install the required dependencies by running the following:
  ```bash
  npm install express pg multer cors dotenv cross-env body-parser
  ```
  - `express`: a web framework for Node.js that simplifies the process of building web applications.
  - `pg`: a PostgreSQL client for Node.js that allows you to interact with a PostgreSQL database.
  - `multer`: a middleware for handling file uploads in Node.js.
  - `cors`: a middleware for enabling Cross-Origin Resource Sharing (CORS) in Node.js.
  - `dotenv`: a module that loads environment variables from a `.env` file into `process.env`.
  - `cross-env`: a module that allows you to set environment variables across different platforms (Windows, macOS, Linux).
  - `body-parser`: a middleware for parsing incoming request bodies in a middleware before your handlers, available under the `req.body` property.
- In `index.js`, your main server file, import dependencies and set up the server:
  ```javascript
  const express = require('express');
  const { Pool } = require('pg');
  const multer = require('multer');
  const cors = require('cors');
  const dotenv = require('dotenv');
  const bodyParser = require('body-parser');
  const path = require('path');
  ```
  - Load environment variables from a `.env` file using `dotenv` for local development.

  ```javascript
  // 2. In Heroku, NODE_ENV will be set to 'production'
  // Load environment variables from .env file for local development
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  ```
  - Set up the Express application and middleware:
  ```javascript
  const app = express();

  // set local listening port
  const LINSTENPORT = 3000;

  // Middleware setup
  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' })); // Handle large JSON data
  ```

  - Set up database connection
  ``` javascript

  // Set up PostgreSQL connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  ```
  - Pictures uploaded by users will not be stored in the database, but in the file system. Database will store the URL link to the pictures. So we need to set up a storage engine using `multer`:
  ```javascript
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files to the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize the original filename: keep only letters, numbers, dots, dashes, and underscores
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, uniqueSuffix + '-' + safeName);
    }
  });
  const upload = multer({ storage: storage });

  // Ensure the 'uploads' directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  ```
  - set up the Mapbox GL JS access token:
  ```javascript
  // Set up Mapbox access token
  app.get('/api/mapbox-token', (req, res) => {
    res.json({ token: process.env.MAPBOX_ACCESS_TOKEN });
  });
  ```
  When in the development environment, the access token is loaded from the `.env` file. When in production, the access token is set as an environment variable in Heroku. In section 4.5.3, we will cover how to set the Mapbox access token in Heroku.
  - set up endpoints for the web server:
  ```javascript
  app.post('/api/save-story', upload.array('images', 10), async (req, res) => {
    const client = await pool.connect();
    try {

      let {words, longitude, latitude} = req.body;
      let files = req.files || [];

      let imagePaths = files.map(file => file.path);

      let query = `
        INSERT INTO stories (words, images, location)
        VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography)
        RETURNING id
      `;
      let values = [words, JSON.stringify(imagePaths), longitude, latitude];
      let result = await client.query(query, values);

      res.status(200).json({ message: 'Story saved successfully!', id: result.rows[0].id });

    } catch (err) {
      console.error('Error saving story:', err);
      res.status(500).send('Error saving story');
    } finally {
      client.release();
    }
  })
  ```
  - Serve uploaded files statically
  ``` javascript
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  ```
  - Serve static files from the public directory
  ```javascript
  app.use(express.static('public'));
  ```

  - Set up Port listening
  ```javascript
  const PORT = process.env.PORT || LINSTENPORT;

  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // Optional: Check database connection on startup
      try {
          const client = await pool.connect();
          console.log("Successfully connected to PostgreSQL database.");
          client.release();
      } catch (err) {
          console.error("Failed to connect to the database:", err);
      }
  });
  ```
- Write a PROCFILE for Heroku
  - Create a file named `Procfile` in the root directory of your project. This file tells Heroku how to run your application. Add the following line to the `Procfile`:
  ```plaintext
  web: node index.js
  ```
  - The `cross-env` command is used to set the `NODE_ENV` environment variable to `production`, which is required by Heroku.
### 4.4 Deploying the Project to Heroku
Heroku is a cloud platform that allows you to deploy and manage web applications easily. Before starting, ensure you have a Heroku account. If you don't have one, sign up for free at [Heroku](https://signup.heroku.com). To deploy your project to Heroku, follow these steps:
- Create a new Heroku app:
  - Log in to your Heroku account and navigate to the Heroku Dashboard.
  - Click on the "New" button and select "Create new app".
  - Enter a name for your app and select a region. Click "Create app" to create the app.
- Connect Heroku to your GitHub repository:
  - In the Heroku app dashboard, go to the "Deploy" tab.
  - Under "Deployment method", select "GitHub".
  - Connect your GitHub account if you haven't done so already.
  - Search for your repository and click "Connect".
  - Enable automatic deploys if you want Heroku to automatically deploy your app whenever you push changes to the main branch of your GitHub repository.
- Choose buildpacks:
  - In the "Settings" tab of your Heroku app, scroll down to the "Buildpacks" section.
  - Click "Add buildpack" and select "Node.js". This will ensure that Heroku uses Node.js to run your application.

### 4.5 Setting Up the PostgreSQL Database
This tutorial uses PostgreSQL as the database to store place-based stories contributed by users. The database schema is defined in the `database.sql` file, which is executed to create the necessary tables in the database.

Two database setups are provided in this tutorial: one is for local development, and the other is for production on Heroku. The database schema is the same for both. It is an industry standard to use separate databases for development and production environments. Because it ensures isolation, safety, and environment-specific optimization:

  1. Safety: Local testing avoids accidentally modifying or deleting production data.

  2. Stability: Production DBs are optimized, backed up, and protected; local DBs can be freely reset or changed.

  3. Environment Parity: Developers simulate production logic locally but with dummy/test data.

  4. Speed: Local DBs offer fast access without network latency during development.

 5. Security: Restrict access to production DB to prevent unauthorized queries or leaks.

#### 4.5.1 Setting Up the PostgreSQL Database Locally
This tutorial uses postgres.app to set up the PostgreSQL database locally. **Be aware that this tutorial operates in MacOS system, if you are a Windows users, steps may be slightly different.**
- First, you need to isntall [Postgres.app](https://postgresapp.com/). Postgres.app is a simple way to install PostgreSQL on macOS. It includes a PostgreSQL server, a graphical user interface (GUI) for managing databases, and command-line tools.
- Then, open Postgres.app and click "initialize" to create a new PostgreSQL server. This will create a new PostgreSQL server running on your local machine.
- Now you already have a PostgreSQL server running on your local machine, you can connect pgAdmin 4 to the PostgreSQL server. Open pgAdmin 4 and create a new connection to the PostgreSQL server. You can use the default settings, which are:
  - Host: localhost
  - Port: 5432
  - Username: Your macOS username
  - Password: (leave it blank)
Once you do this, you will have a "Local Sandbox" server connection in pgAdmin,
- Create a new database for the participatory geonarrative. Right-click on the "Databases" node in the pgAdmin tree view and select "Create" > "Database...". Enter a name for the database, such as `geonarrative`, and click "Save".
- Create the database schema.
  - In pgAdmin, open the Query Tool by right-clicking on the `geonarrative` database and select "Query Tool" button in the dropdown.
  - Copy and paste the content of the `database.sql` file into the Query Tool.
  - Click on the "Execute" button (the lightning bolt icon) to run the SQL commands in the `database.sql` file. This will create the necessary tables in the database.

#### 4.5.2 Setting Up the PostgreSQL Database on Heroku
- Add a PostgreSQL add-on: In your Heorku app dashboard, click on the Overview tab. Under the Installed add-ons section, click on Configure Add-ons. In the Add-ons search bar, type Heroku Postgres and select it.
- > After this step, you have successfully set up a PostgreSQL database on Heroku for your app.
- You can also access the database from pgAdmin 4 by creating a new connection to the Heroku PostgreSQL database:
  - Click on the Heroku Postgres add-on under the Resources tab. This will take you to the Heroku Postgres dashboard.
  - In the Heroku Postgres dashboard, click on the Settings tab.
  - Click on the `View Credentials` button. This will display the credentials for your PostgreSQL database, including the database URL. You will use these credentials shortly to connect pgAdmin 4 to the Heroku PostgreSQL database.
  - Connect to your Database in PgAdmin 4:
    - Open pgAdmin 4, right-click on the `Servers` in the left panel and choose `Register > Server...`.
    - In the `Register - Server` dialog, enter a name for your server (e.g., "Heroku PostgreSQL") and switch to the `Connection` tab.
    - Fill in the connection details using the credentials from the Heroku Postgres dashboard:
      - Host: The `host` value from the Heroku Postgres credentials (e.g., `ec2-54-83-123-45.compute-1.amazonaws.com`)
      - Port: the `Port` value in Heroku credentials.
      - Maintenance database: the `Database` value in Heroku credentials.
      - Username: The `user` value from the Heroku Postgres credentials
      - Password: The `password` value from the Heroku Postgres credentials
    - Click `Save` to create the server connection.
  - Connect to the Database: After creating the server, you can connect to your database. In the left panel, navigate to `Servers > [Your Server Name] > Databases > [Your Database Name]`. Double-click on your database name to connect to it.
  - Open SQL Query Tool: After connecting to your database, you can open the SQL Query Tool. Right-click on your database name and choose Query Tool. This will open a new SQL Query Tool tab.
  - Copy and paste the content of the `database.sql` file into the Query Tool.
  - Click on the "Execute" button (the lightning bolt icon) to run the SQL commands in the `database.sql` file. This will create the necessary tables in the database.
- > After this step, you have successfully set up a PostgreSQL database on Heroku for your app. This database has the same schema as your local database.
#### 4.5.3 Saving Mapbox Access Token
In the local development environment, the Mapbox access token is saved in the `.env` file. In the production environment on Heroku, you can set the Mapbox access token as an environment variable. To do so, follow these steps:
- In the Heroku app dashboard, go to the "Settings" tab.
- Under the "Config Vars" section, click on "Reveal Config Vars".
- Add a new config var with the key `MAPBOX_ACCESS_TOKEN` and the value set to your Mapbox access token.
- Click "Add" to save the config var.

### 4.6 Accessing the Participatory Geonarrative
When you are developing the participatory geonarrative, you will need to access it locally by running the web server on your local machine. When you deploy the participatory geonarrative to Heroku, you can access it on the internet. In this section, we will cover both instances.
#### 4.6.1 Accessing the Geonarrative Locally
You will need to run the web server on your local machine to access the participatory geonarrative. To do so, follow these steps:
- Open a terminal and navigate to the root directory of your project.
- Run the following command to start the web server:
  ```bash
  npm run dev
  ```
  - This command will start the web server and listen on port 3000 (We set listening port 3000 in `index.js`).
- Open your web browser and navigate to `http://localhost:3000`. You should see the participatory geonarrative in your browser. You can now interact with the full function of the geonarrative.
- > Contributions to the participatory geonarrative will be saved to your **local** PostgreSQL database. You can view the contributions in pgAdmin 4 by connecting to your local PostgreSQL database and querying the `stories` table.

#### 4.6.2 Accessing the Geonarrative on Internet.
After you have set up the web client, web server, and PostgreSQL database, you can access the participatory geonarrative by opening your web browser and navigating to the URL of your Heroku app. You can find the URL in the following steps:
- In the Heroku app dashboard, go to the "Settings" tab.
- Under the `Domains` section, you will see the URL of your app.
- Share the URL with others so they can access the participatory geonarrative.
- Contributions to this participatory geonarrative on Heroku will be saved to your **Heroku** PostgreSQL database. You can view the contributions in pgAdmin 4 by connecting to your Heroku PostgreSQL database and querying the `stories` table.
-
This geonarrative has two sections. The first section is an introduction part of hazard basic knowledge in the South Beach area. The second section is a series of GIS-based interactive maps developed in Mapbox GL JS. The first interactive GIS-based map invites map readers to pinpoint places of their interests on the map. The second map is an animation of the historical shoreline in the South Beach area, roughly between Tokeland and Westport. The shoreline animation starts from 1860 when the shoreline was first surveyed, and ends in 2015, which is the latest shoreline survey we acquired from the Washington State Department of Ecology. Last, we also developed an interactive visualization of sea level rise scenarios in the South Beach area in this geonarrative.

## Credits
This participatory geonarrative project draws heavily from [@jakobzhao]'s [Participatory Geonarrative](https://github.com/jakobzhao/participatory-mapping). Grateful for the inspiration and guidance.
***
## Data Sources

We acquired historical shoreline data from two sources. The first is [NOAA's Shoreline Data Explorer](https://nsde.ngs.noaa.gov/), which is a publicly open source. We downloaded the historical shorelines in 1860 and 1911 from NOAA's Shoreline Data Explorer. The second is the Washington State Department of Ecology. We acquired historical shorelines in the South Beach area from the Washington State Department of Ecology in the form of a shapefile. Shorelines are not surveyed each year, the department provided us with digitized South Beach shorelines (roughly defined as Mean High Water) in 1942, 1954, 1967, 1974, 1986, 1995, 1997, 1999, 2001, 2006, and 2015.

To simulate sea level rise scenarios, we accessed raster DEM data from [NOAA's Sea level rise viewer](https://coast.noaa.gov/slr/). The DEM is referenced to NAVD88, and the horizontal resolution is 5 meters.

***
## Methods

This section describes the methods we used to: 1. create the historical shoreline animation and 2. the sea level rise visualization.

### Historical Shoreline Animation

The shoreline is not surveyed regularly in the early years. Nevertheless, the shoreline may evolve rapidly between surveys. For instance, it changed significantly between 1860 and 1911, likely due to the construction of the jetty in 1902. If the animation only includes surveyed shorelines, it will not appear continuously to viewers. To smooth the animation, we interpolate the shorelines during the un-surveyed years, so that the shoreline in each year becomes a frame in the animation.

#### Step 1: Data Preparation

We converted the historical shoreline data from different sources into a common format, GeoJSON LineString Objects referenced to WGS84 (EPSG:4326). The 1860 shoreline is available in the format of a shoreline manuscript (t-sheet). We georeferenced the t-sheet in ArcGIS Pro and exported it in the format of GeoJSON. The shorelines acquired from the Washington State Department of Ecology are in NAD 83 WA state plane S (meters) (EPSG:32149). We used Python to convert it from EPSG:32149 to EPSG:4326 and export it in the format of GeoJSON LineStrings.

#### Step 2: Interpolation

We assume the shoreline evolves linearly between two surveyed shorelines. Since the shorelines are stored in the format of GeoJSON LineStrings. As a result, it is actually a series of points. For each point on the earlier shoreline, we find the nearest point on the later shoreline. We then connect these two points and assume the shoreline point moved at a constant speed from the earlier point to the later point between the two surveys. So the number of interpolated points is determined by the number of years between the two surveys. For example, there are 51 years between 1860 and 1911, so 51 interpolated points exist between the two points. To get the shoreline of each year, we connect all points that belong to the year we want.

We repeat this process for each pair of surveyed shorelines.

##### Step 3: Uncertainty Visualization

The interpolation method assumes the shoreline moves at a constant speed between two surveyed shorelines. This is a simplification of the actual process because there is no probability distribution for the shoreline change process. The shoreline may evolve non-linearly, especially when there were significant human activities, such as the construction of the jetty in 1902. And the uncertainties in the interpolated shorelines are unquantifiable. That is to say, the interpolated shorelines are for smoothing visualization purposes only, we do not suggest that the shoreline is more likely at the interpolated line.

To communicate the uncertainties, in other words, to make viewers aware of the existence of uncertainties, we colored the enclosed area between two surveyed years. This uncertainty visualization method is called ambiguation. The ambiguation colors the enclosed area with a single color value, not a color gradient because there is no probability distribution for the shoreline position, and this type of uncertainty is called bounded uncertainty: the probability distribution is unknown, the actual value lies somewhere between two bounds (immediate preceding and following surveys). So the animation will have a visual effect of shoreline moving within the colored enclosed area.

### Sea Level Rise Visualization

Put simply, we first converted the raster DEM from NAVD88 to MHHW because we visualize inundation under MHHW, then we added the sea level rise scenarios to the MHHW level to get the sea level rise scenarios relative to MHHW. We then interpreted the amount of sea level rise and visualized the range of sea level rise.

#### Step 1: DEM Data Preparation

We used a bathtub model to simulate the sea level rise scenarios. The raster DEM we downloaded  from [NOAA's Sea Level Rise viewer](https://coast.noaa.gov/slr/) is referenced to NAVD88. For the sea level rise scenarios, we want to simulate the sea level rise relative to the Mean Higher High Water (MHHW) level. For example, the sea level rise scenario of 2 feet shows the inundation map of a 2 feet increase in MHHW. The sea level rise scenarios in [NOAA's Sea level rise viewer](https://coast.noaa.gov/slr/) is also referenced to MHHW. We converted the raster DEM from NAVD88 to MHHW by subtracting the difference between MHHW and NAVD88 at Westport to the raster DEM. The MHHW level is 8.02 feet above NAVD88 at Westport, so we subtract 8.02 feet, pixels with negative values and connected to the sea are considered inundated. We then added the sea level rise scenarios to the MHHW level to get the sea level rise scenarios relative to MHHW.

#### Step 2: Amount of Sea Level Rise Interpretation

Sea level rise projections are given in the form of a range for a defined probability. Our sea level rise scenarios cover the range of 90% probability. For example, the sea level rise projection is 1.5 to 4.5 feet means the probability of less than 1.5 feet sea level rise is 5% and the probability of more than 4.5 feet sea level rise is also 5%. In other words, the actual sea level rise has a chance of 90% to fall between 1.5 feet and 4.5 feet. The lower bound is the minimum sea level rise projection, and the upper bound is the maximum sea level rise projection.

We assume the absolute sea level rise and land vertical movement are independent and follow normal distribution. Under this assumption, we can add the lower bound of sea level rise and the lower bound of land movement to get the new lower bound of relative sea level rise. Apparently the same for the upper bound. For example, if the absolute sea level rise has a chance of 90% to fall between 1.5 feet and 4.5 feet, and the land subsidiary has a chance of 90% to fall between 0.5 feet and 2 feet, then the relative sea level rise has a chance of 90% to fall between 2 feet (= 1.5 + 0.5) and 6.5 feet (= 4.5 + 2).

#### Step 3: Sea Level Rise Visualization

To visualize the range of sea level rise, we colored the inundated areas in two colors. The deeper blue indicates the inundated area when the sea level rises by the lower bound amount, and the lighter blue indicates the inundated area when the sea level rises by the upper bound amount.

***
## Deliverables

This is a scroll-down geonarrative. The geonarrative storyline resembles a "martini glass" structure: It starts with an author-driven introduction of hazard situations in the South Beach region, where viewers are expected to follow the sequence controlled by the creator, and then "opens up" with interactive GIS-based maps where viewers are free to contribute their place-based stories and explore hazard scenarios.

The interactive GIS-based maps, developed using Mapbox GL JS, consist of three components. The first is a pinpoint map, allowing viewers to click and mark locations of interest, which remain visible on the map once added. In the second component, viewers can explore the historical significance of their selected locations, while the third component reveals the conditions under which these locations might be inundated by rising sea levels.

The second part of the interactive map is the historical shoreline animation. Viewers can use the play/pause button to control the animation, they can also toggle on and off surveyed shorelines.

The third component of the interactive map focuses on sea level rise scenarios. Viewers are invited to select a greenhouse gas emission scenario and choose whether to account for vertical land movement in the projections. Based on these inputs, a graph displays the projected range of sea level rise by decade through 2150. By moving the cursor along the graph, viewers can see the lower and upper bounds of sea level rise for any selected year. This approach explicitly communicates temporal uncertainty. Simultaneously, the map visualizes spatial uncertainty: for instance, if the lower bound of sea level rise is 0.1 feet and the upper bound is 3 feet, areas inundated at the lower bound appear in deeper blue, while those inundated at the upper bound are shown in lighter blue.

![Shoreline Animation](img/historicalPage.png)
![Sea Level Rise Scenarios](img/slrPage.png)