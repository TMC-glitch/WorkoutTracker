const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const path = require("path");
const PORT = process.env.PORT || 3001;
const db = require("./models");
const app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost/deep-thoughts',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }
);
// routing to stats
app.get("/stats", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/stats.html"));
})
// routing to exercise
app.get("/exercise", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/exercise.html"));
})
// Total duration of all workouts
app.get("/api/workout", (req, res) => {
    db.Workout.aggregate([
        {
            $addFields: {
                totalDuration: { $sum: "$exercise.duration" }
            }
        },
        {
            $sort: { "day": 1 }
        }
    ]).then((data) => {
        res.json(data)
    }).catch((err) => {
        res.json(err)
    });
});
app.get("/api/workout/range", (req, res) => {
    db.Workout.aggregate([
        {
            $addFields: {
                totalDuration: { $sum: "$exercise.duration" }
            }
        },
        {
            $sort: { "day": -1 }
        },
        {
            $limit: 7
        }
    ]).then((data) => {
        res.json(data)
    }).catch((err) => {
        res.json(err)
    });
});

// updating a workout
app.put("/api/workout/:id", (req, res) => {
    db.Workout.updateOne(
        {
            _id: mongodb.ObjectId(req.params.id)
        },
        {
            $push: { exercises: req.body }
        }
    ).then((data) => {
        res.json(data)
    }).catch((err) => {
        res.json(err)
    });
})

// creating a new workout
app.post("/api/workout", (req, res) => {
    db.Workout.create(req.body)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).json(err);
        })
});

app.listen(PORT, () => {
    console.log("App running on port 3001!");
});
