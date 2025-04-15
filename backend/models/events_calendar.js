module.exports = (sequelize, Sequelize) => {
    const Event = sequelize.define("event", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      // You can add more fields like:
      // color: Sequelize.STRING,
      // isAllDay: Sequelize.BOOLEAN,
    });
  
    return Event;
  };