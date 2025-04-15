module.exports = (sequelize, Sequelize) => {
  const Subheading = sequelize.define("subheading", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    headingId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'headings',
        key: 'id'
      }
    },
    title: {
      type: Sequelize.TEXT,
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

  return Subheading;
};
