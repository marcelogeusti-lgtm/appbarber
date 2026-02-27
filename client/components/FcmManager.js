'use client';
import { useEffect } from 'react';
import { useClientAuth } from '../contexts/ClientAuthContext';
// import { useDashboardAuth } from '../contexts/DashboardAuthContext'; // Future or if exists
import useFcm from '../hooks/useFcm';

export default function FcmManager() {
    const { user: clientUser } = useClientAuth();
    // Assuming there might be a separate auth for dashboard, for now clientUser is the main one we found context for

    // Call the hook. It will handle its own logic (request permission, get token, send to backend)
    // only if the user is present.
    useFcm(clientUser);

    return null; // This component doesn't render anything
}
