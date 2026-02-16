module.exports = (sequelize, DataTypes) => {
    const Key = sequelize.define("Key", {
        p: {
            type: DataTypes.TEXT, // BigInt as string
            allowNull: false
        },
        q: {
            type: DataTypes.TEXT, // BigInt as string
            allowNull: false
        },
        D: {
            type: DataTypes.TEXT, // BigInt as string
            allowNull: false
        },
        n: {
            type: DataTypes.TEXT, // BigInt as string
            allowNull: false
        },
        e: {
            type: DataTypes.TEXT, // BigInt as string
            allowNull: false
        },
        d_encrypted: {
            type: DataTypes.TEXT, // BigInt as string
            allowNull: false
        },
        pell_solution_index: {
            type: DataTypes.INTEGER
        }
    });

    return Key;
};
