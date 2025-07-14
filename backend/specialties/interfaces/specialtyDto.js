class SpecialtyDto {
    constructor(specialty) {
        this.id = specialty.id;
        this.name = specialty.name;
        this.description = specialty.description;
        this.isActive = specialty.isActive;
        this.createdAt = specialty.created_at || specialty.createdAt;
        this.updatedAt = specialty.updated_at || specialty.updatedAt;
        
        // Información de médicos asociados si está disponible
        if (specialty.doctors) {
            this.doctors = specialty.doctors.map(doctor => ({
                id: doctor.id,
                medicalLicense: doctor.medicalLicense,
                fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                phone: doctor.phone,
                active: doctor.active
            }));
            this.doctorCount = this.doctors.length;
            this.activeDoctorCount = this.doctors.filter(d => d.active).length;
        } else {
            this.doctorCount = 0;
            this.activeDoctorCount = 0;
        }
    }

    // DTO para crear especialidad (solo campos necesarios)
    static forCreate(data) {
        return {
            name: data.name.trim(),
            description: data.description ? data.description.trim() : null,
            isActive: data.isActive !== undefined ? data.isActive : true
        };
    }

    // DTO para actualizar especialidad (solo campos permitidos)
    static forUpdate(data) {
        const updateData = {};
        
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.description !== undefined) {
            updateData.description = data.description ? data.description.trim() : null;
        }
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        
        return updateData;
    }

    // DTO para listado simplificado
    static forList(specialty) {
        return {
            id: specialty.id,
            name: specialty.name,
            description: specialty.description,
            isActive: specialty.isActive,
            doctorCount: specialty.doctors ? specialty.doctors.length : 0
        };
    }

    // DTO para selector de especialidades (dropdown, etc.)
    static forSelector(specialty) {
        return {
            id: specialty.id,
            value: specialty.id,
            label: specialty.name,
            description: specialty.description,
            isActive: specialty.isActive
        };
    }

    // DTO para búsqueda con información mínima
    static forSearch(specialty) {
        return {
            id: specialty.id,
            name: specialty.name,
            isActive: specialty.isActive,
            doctorCount: specialty.doctors ? specialty.doctors.length : 0
        };
    }

    // DTO para reportes
    static forReport(specialty) {
        const dto = new SpecialtyDto(specialty);
        return {
            basicInfo: {
                id: dto.id,
                name: dto.name,
                description: dto.description,
                isActive: dto.isActive
            },
            statistics: {
                totalDoctors: dto.doctorCount,
                activeDoctors: dto.activeDoctorCount,
                inactiveDoctors: dto.doctorCount - dto.activeDoctorCount
            },
            systemInfo: {
                createdAt: dto.createdAt,
                updatedAt: dto.updatedAt
            }
        };
    }

    // DTO para listado con médicos
    static forListWithDoctors(specialty) {
        const dto = new SpecialtyDto(specialty);
        return {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            isActive: dto.isActive,
            doctorCount: dto.doctorCount,
            activeDoctorCount: dto.activeDoctorCount,
            doctors: dto.doctors
        };
    }

    // DTO para estadísticas detalladas
    static forStats(specialty, doctorStats = {}) {
        return {
            id: specialty.id,
            name: specialty.name,
            isActive: specialty.isActive,
            statistics: {
                totalDoctors: doctorStats.count || 0,
                activeDoctors: doctorStats.active || 0,
                inactiveDoctors: (doctorStats.count || 0) - (doctorStats.active || 0),
                percentage: doctorStats.percentage || '0.0'
            }
        };
    }

    // DTO para dashboard/métricas
    static forDashboard(specialty) {
        const dto = new SpecialtyDto(specialty);
        return {
            id: dto.id,
            name: dto.name,
            isActive: dto.isActive,
            activeDoctorCount: dto.activeDoctorCount,
            status: dto.isActive ? 'Activa' : 'Inactiva',
            availability: dto.activeDoctorCount > 0 ? 'Disponible' : 'No disponible'
        };
    }

    // DTO para respuesta completa
    toResponse() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            isActive: this.isActive,
            doctorCount: this.doctorCount,
            activeDoctorCount: this.activeDoctorCount,
            doctors: this.doctors,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // DTO para respuesta sin médicos (más liviano)
    toResponseLight() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            isActive: this.isActive,
            doctorCount: this.doctorCount,
            activeDoctorCount: this.activeDoctorCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = SpecialtyDto;