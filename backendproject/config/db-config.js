const mongoose = require("mongoose");
const dns = require("dns");

// Set public DNS servers (8.8.8.8, 1.1.1.1) to resolve Windows DNS SRV lookup issues with MongoDB Atlas (querySrv ECONNREFUSED)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore fallback if setServers is restricted
}

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "No MongoDB connection string found in .env. Please set MONGO_URI or MONGODB_URI."
      );
    }

    // Automatically remove angle brackets < > around username and password if present in .env
    uri = uri.replace("://<", "://").replace(">:<", ":").replace(">@", "@");

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n==================================================`);
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`--------------------------------------------------`);

    if (error.message.includes("bad auth")) {
      console.error(`DIAGNOSIS: AUTHENTICATION FAILED (bad auth)`);
      console.error(`Your username or password for MongoDB Atlas is incorrect.`);
      console.error(`TO FIX THIS:`);
      console.error(`1. Open MongoDB Atlas (https://cloud.mongodb.com)`);
      console.error(`2. Go to 'Security' -> 'Database Access'`);
      console.error(`3. Edit your user (or create a new user) and click 'Edit Password'.`);
      console.error(`4. Set a simple password (e.g. 'secret123') and update your .env file.`);
      console.error(`5. Make sure you REMOVE the angle brackets < > in your .env file!`);
    } else if (error.message.includes("querySrv") || error.message.includes("ECONNREFUSED")) {
      console.error(`DIAGNOSIS: DNS / NETWORK RESOLUTION ERROR`);
      console.error(`Node.js could not resolve the MongoDB Atlas SRV address.`);
      console.error(`TO FIX THIS:`);
      console.error(`1. Ensure your internet connection is active.`);
      console.error(`2. In MongoDB Atlas, go to 'Network Access' and click 'Add IP Address' -> 'ALLOW ACCESS FROM ANYWHERE' (0.0.0.0/0).`);
    } else {
      console.error(`DIAGNOSIS: COULD NOT CONNECT TO MONGODB`);
      console.error(`Please check your connection string in .env.`);
    }

    console.error(`==================================================\n`);
    process.exit(1);
  }
};

module.exports = connectDB;