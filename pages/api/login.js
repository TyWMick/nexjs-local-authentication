/*
 *  Portions of this API have been adapted from the Next.js example app
 *  with-cookie-auth, by ZEIT, Inc.
 *    https://github.com/zeit/next.js/tree/canary/examples/with-cookie-auth
 */
"use strict";

import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const dbName = "nextjs-local-authentication";
const colName = "users";

export default async (req, res) => {
  const { username, password } = JSON.parse(req.body);

  // Connect to database
  const client = new MongoClient(process.env.DB, {
    useUnifiedTopology: true
  });
  try {
    await client.connect();
    const col = client.db(dbName).collection(colName);

    // Try to find username
    let user = await col.findOne({ username: username });

    // If no username, user doesn't exist
    if (!user) {
      res.status(404).json({ message: "No user found" });
    } else {
      // Compare user-entered password to stored hash
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (passwordMatch) {
        // Send all-clear with _id as token
        res.status(200).json({ token: user._id.toString() });
      } else {
        res.status(401).json({ message: "Incorrect password" });
      }
    }
  } catch (err) {
    const { response } = err;
    response
      ? res.status(response.status).json({ message: response.statusText })
      : res.status(500).json({ message: err.message });
  }

  // Disconnect from database
  client.close();
};
