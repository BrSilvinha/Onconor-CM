const { DataTypes } = require("sequelize");
const { sequelize } = require('../../config/database');

const defineSpecialty = () => {
    return sequelize.define(
        "specialties",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active'
            },
            flg_deleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            user_created: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            user_updated: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            user_deleted: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            tableName: "specialties",
            indexes: [
                {
                    unique: true,
                    fields: ['name']
                },
                {
                    fields: ['is_active']
                }
            ]
        }
    );
};

// Función que siempre devuelve el modelo con la conexión actual
const Specialty = () => {
    if (!sequelize.models.specialties) {
        defineSpecialty();
    }
    return sequelize.models.specialties;
};

module.exports = Specialty;