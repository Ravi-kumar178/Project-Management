import dotenv from "dotenv";
import app from "./app.js";
import dbConnect from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

dbConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is listening at ${port}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed");
    process.exit(1);
  });


