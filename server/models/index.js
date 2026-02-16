const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, Sequelize);
db.Key = require('./Key')(sequelize, Sequelize);
db.Message = require('./Message')(sequelize, Sequelize);

// Associations
db.User.hasMany(db.Key, { foreignKey: 'userId' });
db.Key.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Message, { foreignKey: 'userId' });
db.Message.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;
