import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Users from './pages/user/list/users';
import UserView from './pages/user/list/user';
import Login from './pages/auth/login';
import Home from './pages/home/home';
import Logout from './pages/auth/logout/logout';
import Layout from './components/layout';
import AddUser from './pages/user/create/addUser';
import AddGroup from './pages/group/create/addGroup';
import DeleteGroup from './pages/group/delete/deleteGroup';
import DeleteUser from './pages/user/delete/deleteUser';
import Groups from './pages/group/list/groups';
import GroupPage from './pages/group/list/group';
import "./main.module.css";
import DebriefForm from './pages/debrief/create/debrief';
import Debriefs from './pages/debrief/view/debriefs';
import DebriefView from './pages/debrief/view/debrief';
createRoot(document.getElementById('root')!).render(
  <Router>
            <Routes>
                <Route path = "/" element={<Layout />}>
                <Route path = "/login" element={<Login />} />
                <Route path = "/users" element={<Users />} />
                <Route path = "/user/:id" element={<UserView />} />
                <Route path = "/logout" element={<Logout />} />
                <Route path = "/home" element={<Home />} />
                <Route path = "/deleteGroup" element={<DeleteGroup />} />
                <Route path = "/createGroup" element={<AddGroup />} />
                <Route path = "/deleteUser" element={<DeleteUser />} />
                <Route path = "/createUser" element={<AddUser />} />
                <Route path = "/groups" element={<Groups />} />
                <Route path = "/group/:id" element={<GroupPage />} />
                <Route path = "/createDebrief" element={<DebriefForm />} />
                <Route path = "/debriefs" element={<Debriefs />} />
                <Route path = "debrief/:id" element={<DebriefView />} />
                </Route>
            </Routes>
        </Router>
)
