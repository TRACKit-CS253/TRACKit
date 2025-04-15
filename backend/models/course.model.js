module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define("course", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    credits: {
      type: Sequelize.INTEGER,
      defaultValue: 9
    },
    semester: {
      type: Sequelize.STRING
    }
  }, {
    // Add these options to control table naming
    freezeTableName: true, // Prevents pluralization
    tableName: 'course'   // Explicitly sets the table name
  });

  return Course;
};
