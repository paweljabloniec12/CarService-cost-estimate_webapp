import React, { useEffect, useState } from 'react';
import OrdersTable from './OrdersTable';
import ClientsTable from './ClientsTable';
import VehiclesTable from './VehiclesTable';
import ServicesTable from './ServicesTable';
import MaterialsTable from './MaterialsTable';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';


function Success({ activeComponent, handleNavigate }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    setUser(session.user);
                } else {
                    navigate('/');
                }
                setIsLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]);

    if (isLoading) {
        return <div>Ładowanie...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="App">
            <Navbar
                onNavigate={handleNavigate}
                activeComponent={activeComponent}
            />
            <div className="content">
                {activeComponent === 'orders' && <OrdersTable />}
                {activeComponent === 'clients' && <ClientsTable />}
                {activeComponent === 'vehicles' && <VehiclesTable />}
                {activeComponent === 'services' && <ServicesTable />}
                {activeComponent === 'materials' && <MaterialsTable />}
            </div>
        </div>
    );
}

export default Success;