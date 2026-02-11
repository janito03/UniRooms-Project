require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Room = require("./models/Room");

async function setupDatabase() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!\n");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Room.deleteMany({});
    console.log("Existing data cleared\n");

    // Create Users
    console.log("👥 Creating users...");

    const users = [
      {
        username: "admin",
        email: "admin@uniroom.edu",
        password_hash: await bcrypt.hash("admin123", 10),
        role: "admin",
      },
      {
        username: "teacher",
        email: "teacher@uniroom.edu",
        password_hash: await bcrypt.hash("teacher123", 10),
        role: "teacher",
      },
      {
        username: "student",
        email: "student@uniroom.edu",
        password_hash: await bcrypt.hash("student123", 10),
        role: "student",
      },
    ];

    await User.insertMany(users);
    console.log("Created 3 users:");
    console.log("- admin (admin123)");
    console.log("- teacher (teacher123)");
    console.log("- student (student123)\n");

    // Create Rooms
    console.log("Creating rooms...");

    const rooms = [
      {
        roomNumber: "101",
        capacity: 30,
        type: "normal",
        features: ["Projector", "Whiteboard"],
      },
      {
        roomNumber: "102",
        capacity: 25,
        type: "lab",
        features: ["Computers", "Projector"],
      },
      {
        roomNumber: "201",
        capacity: 50,
        type: "lecture_hall",
        features: ["Projector", "Sound System", "Microphone"],
      },
      {
        roomNumber: "202",
        capacity: 15,
        type: "conference",
        features: ["TV", "Whiteboard", "Video Conference"],
      },
      {
        roomNumber: "Lab-A",
        capacity: 40,
        type: "lab",
        features: ["Computers", "Projector", "AC"],
      },
    ];

    await Room.insertMany(rooms);
    console.log(" Created 5 rooms:");
    rooms.forEach((room) => {
      console.log(
        `   - Room ${room.roomNumber} (${room.type}, capacity: ${room.capacity})`,
      );
    });

    console.log("\nDatabase setup completed successfully!");
    console.log("\nYou can now login at frontend/index.html with:");
    console.log("Admin: admin / admin123");
    console.log("Teacher: teacher / teacher123");
    console.log("Student: student / student123");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
}

setupDatabase();
