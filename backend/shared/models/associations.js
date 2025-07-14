const User = require('../../users/models/user');
const Patient = require('../../patients/models/patient');
const Doctor = require('../../doctors/models/doctor');
const Specialty = require('../../specialties/models/specialty');

const setupAssociations = () => {
    try {
        // Obtener instancias de los modelos
        const UserModel = User();
        const PatientModel = Patient();
        const DoctorModel = Doctor();
        const SpecialtyModel = Specialty();

        // User -> Patient (1:1)
        UserModel.hasOne(PatientModel, {
            foreignKey: 'user_id',
            as: 'patient',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        PatientModel.belongsTo(UserModel, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // User -> Doctor (1:1)
        UserModel.hasOne(DoctorModel, {
            foreignKey: 'user_id',
            as: 'doctor',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        DoctorModel.belongsTo(UserModel, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Specialty -> Doctor (1:N)
        SpecialtyModel.hasMany(DoctorModel, {
            foreignKey: 'specialty_id',
            as: 'doctors',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        DoctorModel.belongsTo(SpecialtyModel, {
            foreignKey: 'specialty_id',
            as: 'specialty',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        console.log('✅ Model associations established successfully');
        
        return {
            User: UserModel,
            Patient: PatientModel,
            Doctor: DoctorModel,
            Specialty: SpecialtyModel
        };

    } catch (error) {
        console.error('❌ Error setting up model associations:', error);
        throw error;
    }
};

module.exports = {
    setupAssociations,
    models: {
        User,
        Patient,
        Doctor,
        Specialty
    }
};