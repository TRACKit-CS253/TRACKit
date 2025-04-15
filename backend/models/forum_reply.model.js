module.exports = (sequelize, Sequelize) => {
    const ForumReply = sequelize.define("forum_reply", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      postId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  
    return ForumReply;
  };