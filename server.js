import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/users", (req, res) => {
  const data = fs.readFileSync("./data.json", "utf-8");
  const users = JSON.parse(data);
  res.json(users.users);
});

app.post("/register", (req, res) => {
  const data = fs.readFileSync("./data.json", "utf-8");
  const users = JSON.parse(data);
  users.users.push(req.body);
  fs.writeFileSync("./data.json", JSON.stringify(users));
  res.json({ message: "User registered" });
});

app.post("/login", (req, res) => {
  const data = fs.readFileSync("./data.json", "utf-8");
  const users = JSON.parse(data);

  const user = users.users.find((user) => {
    return user.name === req.body.name && user.password === req.body.password;
  });

  if (user) {
    res.json({ message: "Login successful" });
  } else {
    res.status(400).json({ message: "Invalid name or password" });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
