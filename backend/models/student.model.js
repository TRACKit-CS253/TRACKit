module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define("student", {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rollNumber: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    enrollmentYear: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    major: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    // Add these options to control table naming
    freezeTableName: true, // Prevents pluralization
    tableName: 'student'   // Explicitly sets the table name
  });

  return Student;
};
