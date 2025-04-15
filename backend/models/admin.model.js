module.exports = (sequelize, Sequelize) => {
  const Admin = sequelize.define("admin", {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  });

  return Admin;
};
