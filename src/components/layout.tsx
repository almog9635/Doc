import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './navbar/navbar';

const Layout: React.FC = () => {
    const location = useLocation();
    const hideNavbar = location.pathname === '/login';

    return (
        <div>
            {!hideNavbar && <Navbar />}
            <Outlet />
        </div>
    );
};

export default Layout;