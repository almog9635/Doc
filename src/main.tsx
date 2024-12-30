import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Users from './components/views/users/users.tsx'
import UserView from './components/views/users/user.tsx';

createRoot(document.getElementById('root')!).render(
  <Router>
            <Routes>
                <Route path="/users" element={<Users />} />
                <Route path="/user/:id" element={<UserView />} />
            </Routes>
        </Router>
)
