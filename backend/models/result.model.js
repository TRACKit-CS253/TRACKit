module.exports = (sequelize, Sequelize) => {
    const Result = sequelize.define("result", {
      obtainedMarks: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      examId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'exam',
          key: 'id'
        }
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user',
          key: 'id'
        }
      }
    });
  
    return Result;
  };