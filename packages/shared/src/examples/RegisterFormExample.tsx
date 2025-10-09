/**
 * Ejemplo de uso del hook useAuth con autologin
 * Demuestra cómo implementar registro con autologin automático
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { RegisterCredentials } from '../types/auth';

export const RegisterFormExample: React.FC = () => {
    const { register, isLoading, error } = useAuth();
    const [formData, setFormData] = useState<RegisterCredentials>({
        email: '',
        password: '',
        nombre: '',
        apellidos: '',
        role: 'trainer' as const
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Registro con autologin automático
            const authData = await register(formData);
            
            // El usuario ya está autenticado y redirigido automáticamente
            console.log('Usuario registrado y autenticado:', authData.user);
            
        } catch (error) {
            console.error('Error en registro:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
            />
            
            <input
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
            />
            
            <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
            />
            
            <input
                type="text"
                placeholder="Apellidos"
                value={formData.apellidos}
                onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                required
            />
            
            <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
            >
                <option value="trainer">Entrenador</option>
                <option value="athlete">Atleta</option>
            </select>
            
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
            
            {error && <div className="error">{error}</div>}
        </form>
    );
};
