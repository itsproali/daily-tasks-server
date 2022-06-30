const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.jggf1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    client.connect();
    const taskCollection = client.db("DailyTasks").collection("tasks");

    // Add New Task
    app.post("/add-task", async (req, res) => {
      const task = req?.body;
      const userId = req?.body?.userId;
      const addTask = await taskCollection.insertOne(task);
      res.send(addTask);
    });

    //   Get All task
    app.get("/tasks/:userId", async (req, res) => {
      const userId = req.params.userId;
      const query = { userId, completed: false };
      const tasks = await taskCollection.find(query).toArray();
      res.send(tasks);
    });

    // Complete a Task
    app.patch("/completed/:taskId", async (req, res) => {
      const getId = req.params.taskId;
      const taskId = { _id: ObjectId(getId) };
      const updateInfo = {
        $set: { completed: true },
      };
      const result = await taskCollection.updateOne(taskId, updateInfo);
      res.send(result);
    });

    // UnComplete a Task
    app.patch("/un-complete/:taskId", async (req, res) => {
      const getId = req.params.taskId;
      const taskId = { _id: ObjectId(getId) };
      const updateInfo = {
        $set: { completed: false },
      };
      const result = await taskCollection.updateOne(taskId, updateInfo);
      res.send(result);
    });

    // Get Completed Task
    app.get("/completed-task/:userId", async (req, res) => {
      const userId = req.params.userId;
      const query = { userId, completed: true };
      const completed = await taskCollection.find(query).toArray();
      res.send(completed);
    });

    // Delete a task
    app.delete("/delete-task/:taskId", async (req, res) => {
      const taskId = req.params.taskId;
      const deleted = await taskCollection.deleteOne({ _id: ObjectId(taskId) });
      res.send(deleted);
    });

    // Update a task
    app.patch("/update-task/:taskId", async (req, res) => {
      const taskId = req.params.taskId;
      const query = { _id: ObjectId(taskId) };
      const details = req.body.details;
      const updateInfo = {
        $set: { details },
      };
      const result = await taskCollection.updateOne(query, updateInfo);
      res.send(result);
    });
  } finally {
    // client.close()
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Daily Task Server");
});

app.listen(port, () => {
  console.log("Daily Task Server is running on: ", port);
});
