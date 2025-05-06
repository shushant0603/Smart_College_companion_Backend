import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  totalClasses: {
    type: Number,
    required: true,
    default: 0,
  },
  attendedClasses: {
    type: Number,
    required: true,
    default: 0,
  },
  percentage: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate percentage before saving
attendanceSchema.pre('save', function (next) {
  if (this.totalClasses > 0) {
    this.percentage = (this.attendedClasses / this.totalClasses) * 100;
  }
  this.updatedAt = Date.now();
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance; 