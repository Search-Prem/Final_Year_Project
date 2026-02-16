module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
        plaintext: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        ascii_values: {
            type: DataTypes.JSON, // Array of numbers/strings
            allowNull: false
        },
        ciphertext_values: {
            type: DataTypes.JSON, // Array of BigInt strings
            allowNull: false
        },
        homomorphic_result: {
            type: DataTypes.TEXT, // Result of cloud multiplication (BigInt string)
            allowNull: true
        },
        decrypted_result: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    return Message;
};
