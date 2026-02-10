const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const BaseSchedule = require("../models/BaseSchedule");
const { authenticate, isTeacher } = require("../middleware/auth");

const hasTimeConflict = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

router.post("/", authenticate, async (req, res) => {
  try {
    const { room_id, startTime, endTime } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (userRole === "student") {
      const durationHours = (end - start) / (1000 * 60 * 60);
      if (durationHours > 2) {
        return res.status(400).json({
          message: "Students can only book for 2 hours maximum",
        });
      }
    }

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][start.getDay()];

    const baseConflicts = await BaseSchedule.find({
      room_id,
      dayOfWeek,
    });

    for (let baseEntry of baseConflicts) {
      const baseStart = new Date(`2000-01-01 ${baseEntry.startTime}`);
      const baseEnd = new Date(`2000-01-01 ${baseEntry.endTime}`);
      const bookStart = new Date(
        `2000-01-01 ${start.getHours()}:${start.getMinutes()}`,
      );
      const bookEnd = new Date(
        `2000-01-01 ${end.getHours()}:${end.getMinutes()}`,
      );

      if (hasTimeConflict(bookStart, bookEnd, baseStart, baseEnd)) {
        return res.status(409).json({
          message: "Room occupied by official class (Base Schedule)",
          conflictType: "base_schedule",
        });
      }
    }

    const existingBookings = await Booking.find({
      room_id,
      status: "confirmed",
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).populate("user_id", "role username");

    if (existingBookings.length > 0) {
      if (userRole === "admin") {
        await Booking.updateMany(
          { _id: { $in: existingBookings.map((b) => b._id) } },
          { $set: { status: "overridden", overriddenBy: userId } },
        );

        const booking = new Booking({
          room_id,
          user_id: userId,
          startTime: start,
          endTime: end,
          status: "confirmed",
        });

        await booking.save();

        const result = await Booking.findById(booking._id)
          .populate("room_id", "roomNumber type")
          .populate("user_id", "username role");

        return res.status(201).json({
          ...result.toObject(),
          message: `Booking overridden by admin.`,
          overridden: true,
          overriddenCount: existingBookings.length,
        });
      }

      if (userRole === "teacher") {
        const nonStudentConflict = existingBookings.find(
          (b) => b.user_id.role !== "student",
        );

        if (nonStudentConflict) {
          return res.status(409).json({
            message: `Room already booked by ${nonStudentConflict.user_id.role}: ${nonStudentConflict.user_id.username}`,
            conflict: nonStudentConflict,
            conflictType: "teacher_or_admin",
          });
        }

        await Booking.updateMany(
          { _id: { $in: existingBookings.map((b) => b._id) } },
          { $set: { status: "overridden", overriddenBy: userId } },
        );

        const booking = new Booking({
          room_id,
          user_id: userId,
          startTime: start,
          endTime: end,
          status: "confirmed",
        });

        await booking.save();

        const result = await Booking.findById(booking._id)
          .populate("room_id", "roomNumber type")
          .populate("user_id", "username role");

        return res.status(201).json({
          ...result.toObject(),
          message: `Student booking overridden. Room booked for teacher.`,
          overridden: true,
          overriddenCount: existingBookings.length,
        });
      }

      const conflict = existingBookings[0];
      return res.status(409).json({
        message: `Room already booked by ${conflict.user_id.role}`,
        conflict: conflict,
        conflictType: "student_blocked",
      });
    }

    const booking = new Booking({
      room_id,
      user_id: userId,
      startTime: start,
      endTime: end,
      status: "confirmed",
    });

    await booking.save();

    const result = await Booking.findById(booking._id)
      .populate("room_id", "roomNumber type")
      .populate("user_id", "username role");

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my-bookings", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user_id: req.user.userId,
      status: { $in: ["confirmed", "overridden"] },
    })
      .populate("room_id", "roomNumber type capacity")
      .populate("overriddenBy", "username role")
      .sort({ startTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for a specific room on a specific date
router.get("/room/:roomId", authenticate, async (req, res) => {
  try {
    const { date } = req.query;
    const { roomId } = req.params;

    if (!date) {
      return res.status(400).json({ message: "Date parameter required" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      room_id: roomId,
      status: "confirmed",
      startTime: { $lt: endOfDay },
      endTime: { $gt: startOfDay },
    })
      .populate("user_id", "username role")
      .sort({ startTime: 1 });

    // Also get base schedules for that day
    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][startOfDay.getDay()];

    const baseSchedules = await BaseSchedule.find({
      room_id: roomId,
      dayOfWeek,
    });

    res.json({ bookings, baseSchedules });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:bookingId", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      booking.user_id.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
