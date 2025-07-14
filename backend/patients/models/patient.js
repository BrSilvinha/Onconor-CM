const { DataTypes } = require("sequelize");
const { sequelize } = require('../../config/database');

const definePatient = () => {
    return sequelize.define(
        "patients",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            dni: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
            firstName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'first_name'
            },
            lastName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'last_name'
            },
            dateOfBirth: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field: 'date_of_birth'
            },
            gender: {
                type: DataTypes.ENUM('M', 'F', 'O'),
                allowNull: false,
                comment: 'M=Male, F=Female, O=Other'
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            emergencyContact: {
                type: DataTypes.STRING(200),
                allowNull: true,
                field: 'emergency_contact'
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
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
            tableName: "patients",
            indexes: [
                {
                    unique: true,
                    fields: ['dni']
                },
                {
                    fields: ['user_id']
                },
                {
                    fields: ['active']
                }
            ]
        }
    );
};

// Función que siempre devuelve el modelo con la conexión actual
const Patient = () => {
    if (!sequelize.models.patients) {
        definePatient();
    }
    return sequelize.models.patients;
};

module.exports = Patient;