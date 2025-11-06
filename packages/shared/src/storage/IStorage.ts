/**
 * IStorage - Interface cross-platform para persistencia de datos.
 * 
 * Web implementa con localStorage.
 * React Native implementará con AsyncStorage.
 * 
 * Todas las operaciones son async para compatibilidad con AsyncStorage.
 * 
 * @author Frontend Team
 * @since v4.1.0
 */

export interface IStorage {
    /**
     * Obtener valor del storage
     * @returns Promise con el valor o null si no existe
     */
    getItem(key: string): Promise<string | null>;
    
    /**
     * Guardar valor en storage
     */
    setItem(key: string, value: string): Promise<void>;
    
    /**
     * Eliminar valor del storage
     */
    removeItem(key: string): Promise<void>;
}

/**
 * Instancia global de storage.
 * Se inyecta desde cada plataforma (web o mobile).
 */
export let storage: IStorage;

/**
 * Inicializar storage con implementación específica de plataforma.
 * Llamar esto desde main.tsx (web) o index.tsx (mobile) antes de crear el store.
 */
export function initStorage(storageImpl: IStorage): void {
    storage = storageImpl;
}
