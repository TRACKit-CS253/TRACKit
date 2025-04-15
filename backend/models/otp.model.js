module.exports = (sequelize, Sequelize) => {
  const OTP = sequelize.define("otp", {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    otp: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    expiry: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });

  return OTP;
};
