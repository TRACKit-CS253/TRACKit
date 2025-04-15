module.exports = (sequelize, Sequelize) => {
    const courseDescriptionEntry = sequelize.define("courseDescriptionEntry", {
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
      facultyId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'faculty',
          key: 'userId'
        }
      },
      courseDescriptionEntryHeading: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      courseDescriptionEntryBody: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // seenBy: {
      //   type: Sequelize.JSON,
      //   comment: 'List of student IDs who have seen the courseDescriptionEntry'
      // },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  
    return courseDescriptionEntry;
  };
  