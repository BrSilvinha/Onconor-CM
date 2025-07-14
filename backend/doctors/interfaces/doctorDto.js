class DoctorDto {
    constructor(doctor) {
        this.id = doctor.id;
        this.userId = doctor.userId;
        this.medicalLicense = doctor.medicalLicense;
        this.firstName = doctor.firstName;
        this.lastName = doctor.lastName;
        this.phone = doctor.phone;
        this.specialtyId = doctor.specialtyId;
        this.active = doctor.active;
        this.createdAt = doctor.created_at || doctor.createdAt;
        this.updatedAt = doctor.updated_at || doctor.updatedAt;
        
        // Campos calculados
        this.fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
        this.displayTitle = this.getDisplayTitle(doctor);
        
        // Información de especialidad si está disponible
        if (doctor.specialty) {
            this.specialty = {
                id: doctor.specialty.id,
                name: doctor.specialty.name,
                description: doctor.specialty.description,
                isActive: doctor.specialty.isActive
            };
            this.specialtyName = doctor.specialty.name;
        } else {
            this.specialtyName = 'Sin especialidad';
        }
        
        // Información del usuario asociado si está disponible
        if (doctor.user) {
            this.user = {
                id: doctor.user.id,
                email: doctor.user.email,
                username: doctor.user.username,
                active: doctor.user.active
            };
        }
    }

    getDisplayTitle(doctor) {
        const specialtyName = doctor.specialty ? doctor.specialty.name : 'Sin especialidad';
        return `Dr. ${doctor.firstName} ${doctor.lastName} - ${specialtyName}`;
    }

    // DTO para crear médico (solo campos necesarios)
    static forCreate(data) {
        return {
            userId: data.userId,
            medicalLicense: data.medicalLicense.toUpperCase(), // Normalizar a mayúsculas
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || null,
            specialtyId: data.specialtyId
        };
    }

    // DTO para actualizar médico (solo campos permitidos)
    static forUpdate(data) {
        const updateData = {};
        
        if (data.medicalLicense !== undefined) {
            updateData.medicalLicense = data.medicalLicense.toUpperCase();
        }
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.specialtyId !== undefined) updateData.specialtyId = data.specialtyId;
        
        return updateData;
    }

    // DTO para listado simplificado
    static forList(doctor) {
        return {
            id: doctor.id,
            medicalLicense: doctor.medicalLicense,
            fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad',
            phone: doctor.phone,
            active: doctor.active
        };
    }

    // DTO para búsqueda con información mínima
    static forSearch(doctor) {
        return {
            id: doctor.id,
            medicalLicense: doctor.medicalLicense,
            fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad',
            active: doctor.active
        };
    }

    // DTO para selector de médicos (dropdown, etc.)
    static forSelector(doctor) {
        return {
            id: doctor.id,
            value: doctor.id,
            label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            medicalLicense: doctor.medicalLicense,
            specialtyName: doctor.specialty ? doctor.specialty.name : 'Sin especialidad',
            active: doctor.active
        };
    }

    // DTO para reportes
    static forReport(doctor) {
        const dto = new DoctorDto(doctor);
        return {
            basicInfo: {
                id: dto.id,
                medicalLicense: dto.medicalLicense,
                fullName: dto.fullName,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                specialty: dto.specialty,
                specialtyName: dto.specialtyName
            },
            systemInfo: {
                userId: dto.userId,
                specialtyId: dto.specialtyId,
                active: dto.active,
                createdAt: dto.createdAt,
                updatedAt: dto.updatedAt
            }
        };
    }

    // DTO para listado por especialidad
    static forSpecialtyListing(doctor) {
        return {
            id: doctor.id,
            medicalLicense: doctor.medicalLicense,
            fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            phone: doctor.phone,
            active: doctor.active,
            yearsOfExperience: null, // Placeholder para futura implementación
            availability: null // Placeholder para integración con módulo de horarios
        };
    }

    // DTO para perfil público del médico
    static forPublicProfile(doctor) {
        return {
            id: doctor.id,
            medicalLicense: doctor.medicalLicense,
            fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialty: doctor.specialty ? {
                name: doctor.specialty.name,
                description: doctor.specialty.description
            } : null,
            phone: doctor.phone,
            active: doctor.active
        };
    }

    // DTO para respuesta completa
    toResponse() {
        return {
            id: this.id,
            userId: this.userId,
            medicalLicense: this.medicalLicense,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName,
            displayTitle: this.displayTitle,
            phone: this.phone,
            specialtyId: this.specialtyId,
            specialtyName: this.specialtyName,
            specialty: this.specialty,
            active: this.active,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            user: this.user
        };
    }
}

module.exports = DoctorDto;