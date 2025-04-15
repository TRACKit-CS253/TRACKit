module.exports = (sequelize, Sequelize) => {
  const Heading = sequelize.define("heading", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    courseId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'course',
        key: 'id'
      }
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  });

  return Heading;
};
