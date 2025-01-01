import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Users from './pages/views/users/users.tsx';
import UserView from './pages/views/users/user.tsx';
import Login from './pages/login/login.tsx';
import Home from './pages/home/home.tsx';
import Logout from './components/logout/logout.tsx';
import Layout from './components/layout.tsx';

createRoot(document.getElementById('root')!).render(
  <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                <Route path = "/login" element={<Login />} />
                <Route path="/users" element={<Users />} />
                <Route path="/user/:id" element={<UserView />} />
                <Route path="/logout" element={<Logout />} />
                <Route path = "/home" element={<Home />} />
                </Route>
            </Routes>
        </Router>
)
