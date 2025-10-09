import { useEffect } from 'react';
import { useDataStore } from '../useDataStore';

export const useOnlineStatus = () => {
  const { isOnline, setOnlineStatus, syncPendingChanges } = useDataStore();

  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Conexión restaurada');
      setOnlineStatus(true);
      // Intentar sincronizar cambios pendientes
      syncPendingChanges();
    };

    const handleOffline = () => {
      console.log('🔴 Sin conexión');
      setOnlineStatus(false);
    };

    // Escuchar eventos de conexión
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, syncPendingChanges]);

  return { isOnline };
};