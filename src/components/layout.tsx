import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './navbar/navbar';
import TokenWrapper from './wrapper/tokenWrapper';

const Layout: React.FC = () => {
    const location = useLocation();
    const hideNavbar = location.pathname === '/login';

    return (
        <TokenWrapper>
        <div>
            {!hideNavbar && <Navbar />}
            <Outlet />
        </div>
        </TokenWrapper>
    );
};

export default Layout;