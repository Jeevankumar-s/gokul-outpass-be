const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.db'
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('employee', 'hr'),
    allowNull: false,
  },
});

const Outpass = sequelize.define('Outpass', {
  id: {
    type: DataTypes.UUID, // Use UUID as primary key
    defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  current_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
});

const Assignment = sequelize.define('Assignment', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

const Submission = sequelize.define('Submission', {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Define relationships
User.hasMany(Assignment, { foreignKey: 'teacherId' });
Assignment.belongsTo(User, { foreignKey: 'teacherId' });

User.hasMany(Submission, { foreignKey: 'studentId' });
Submission.belongsTo(User, { foreignKey: 'studentId' });

Assignment.hasMany(Submission, { foreignKey: 'assignmentId' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId' });

module.exports = { sequelize, User, Outpass, Assignment, Submission };
