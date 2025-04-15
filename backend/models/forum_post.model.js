module.exports = (sequelize, Sequelize) => {
    const ForumPost = sequelize.define("forum_post", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      query: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }, {
      timestamps: true, 
      paranoid: true
    });

    return ForumPost;
  };