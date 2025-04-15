module.exports = (sequelize, Sequelize) => {
  const Faculty = sequelize.define("faculty", {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    department: {
      type: Sequelize.STRING,
      allowNull: false
    },
    position: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    // Add these options to control table naming
    freezeTableName: true, // Prevents pluralization
    tableName: 'faculty'   // Explicitly sets the table name
  });

  return Faculty;
};
