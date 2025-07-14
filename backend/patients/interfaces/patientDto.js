class PatientDto {
    constructor(patient) {
        this.id = patient.id;
        this.userId = patient.userId;
        this.dni = patient.dni;
        this.firstName = patient.firstName;
        this.lastName = patient.lastName;
        this.dateOfBirth = patient.dateOfBirth;
        this.gender = patient.gender;
        this.phone = patient.phone;
        this.address = patient.address;
        this.emergencyContact = patient.emergencyContact;
        this.active = patient.active;
        this.createdAt = patient.created_at || patient.createdAt;
        this.updatedAt = patient.updated_at || patient.updatedAt;
        
        // Campos calculados
        this.fullName = `${patient.firstName} ${patient.lastName}`;
        this.age = this.calculateAge(patient.dateOfBirth);
        this.genderDisplay = this.getGenderDisplay(patient.gender);
        
        // Información del usuario asociado si está disponible
        if (patient.user) {
            this.user = {
                id: patient.user.id,
                email: patient.user.email,
                username: patient.user.username,
                active: patient.user.active
            };
        }
    }

    calculateAge(dateOfBirth) {
        if (!dateOfBirth) return null;
        
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    getGenderDisplay(gender) {
        switch (gender) {
            case 'M': return 'Masculino';
            case 'F': return 'Femenino';
            case 'O': return 'Otro';
            default: return 'No especificado';
        }
    }

    // DTO para crear paciente (solo campos necesarios)
    static forCreate(data) {
        return {
            userId: data.userId,
            dni: data.dni,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            phone: data.phone || null,
            address: data.address || null,
            emergencyContact: data.emergencyContact || null
        };
    }

    // DTO para actualizar paciente (solo campos permitidos)
    static forUpdate(data) {
        const updateData = {};
        
        if (data.dni !== undefined) updateData.dni = data.dni;
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
        if (data.gender !== undefined) updateData.gender = data.gender;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
        
        return updateData;
    }

    // DTO para listado simplificado
    static forList(patient) {
        return {
            id: patient.id,
            dni: patient.dni,
            fullName: `${patient.firstName} ${patient.lastName}`,
            age: new PatientDto(patient).calculateAge(patient.dateOfBirth),
            gender: new PatientDto(patient).getGenderDisplay(patient.gender),
            phone: patient.phone,
            active: patient.active
        };
    }

    // DTO para búsqueda con información mínima
    static forSearch(patient) {
        return {
            id: patient.id,
            dni: patient.dni,
            fullName: `${patient.firstName} ${patient.lastName}`,
            phone: patient.phone,
            active: patient.active
        };
    }

    // DTO para reportes
    static forReport(patient) {
        const dto = new PatientDto(patient);
        return {
            basicInfo: {
                id: dto.id,
                dni: dto.dni,
                fullName: dto.fullName,
                age: dto.age,
                gender: dto.genderDisplay,
                dateOfBirth: dto.dateOfBirth,
                phone: dto.phone,
                address: dto.address,
                emergencyContact: dto.emergencyContact
            },
            systemInfo: {
                userId: dto.userId,
                active: dto.active,
                createdAt: dto.createdAt,
                updatedAt: dto.updatedAt
            }
        };
    }

    // DTO para respuesta completa
    toResponse() {
        return {
            id: this.id,
            userId: this.userId,
            dni: this.dni,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName,
            dateOfBirth: this.dateOfBirth,
            age: this.age,
            gender: this.gender,
            genderDisplay: this.genderDisplay,
            phone: this.phone,
            address: this.address,
            emergencyContact: this.emergencyContact,
            active: this.active,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            user: this.user
        };
    }
}

module.exports = PatientDto;