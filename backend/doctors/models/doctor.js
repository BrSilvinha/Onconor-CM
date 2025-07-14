const { DataTypes } = require("sequelize");
const { sequelize } = require('../../config/database');

const defineDoctor = () => {
    return sequelize.define(
        "doctors",
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
            medicalLicense: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                field: 'medical_license'
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
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            specialtyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'specialty_id',
                references: {
                    model: 'specialties',
                    key: 'id'
                }
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
            tableName: "doctors",
            indexes: [
                {
                    unique: true,
                    fields: ['medical_license']
                },
                {
                    fields: ['user_id']
                },
                {
                    fields: ['specialty_id']
                },
                {
                    fields: ['active']
                }
            ]
        }
    );
};

// Función que siempre devuelve el modelo con la conexión actual
const Doctor = () => {
    if (!sequelize.models.doctors) {
        defineDoctor();
    }
    return sequelize.models.doctors;
};

module.exports = Doctor;