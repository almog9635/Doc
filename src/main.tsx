import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Users from './pages/views/users/users.tsx';
import UserView from './pages/views/users/user.tsx';
import Login from './pages/login/login.tsx';

createRoot(document.getElementById('root')!).render(
  <Router>
            <Routes>
                <Route path = "/login" element={<Login />} />
                <Route path="/users" element={<Users />} />
                <Route path="/user/:id" element={<UserView />} />
            </Routes>
        </Router>
)
