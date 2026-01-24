import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

let username = process.env.name;
console.log(username);
console.log("ravi");

console.log("Got it");
