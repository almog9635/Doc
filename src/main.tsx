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
import Groups from './pages/group/list/groups';
import GroupPage from './pages/group/list/group';
import "./main.module.css";
import DebriefForm from './pages/debrief/create/debrief';
import Debriefs from './pages/debrief/view/debriefs';
import DebriefView from './pages/debrief/view/debrief';
import UpdateDebriefPage from './pages/debrief/update/debrief';
import CommanderPage from './pages/commander/CommanderPage';
import UpdateGroup from './pages/group/edit/updateGroup';
import UpdateUser from './pages/user/edit/user';
import Unauthorized from './pages/unauthorized/unauthorized';
import DeleteDebriefById from './pages/debrief/delete/debrief';
import StatisticsPage from './pages/statistics/StatisticsPage';

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
                <Route path = "/createUser" element={<AddUser />} />
                <Route path = "/groups" element={<Groups />} />
                <Route path = "/group/:id" element={<GroupPage />} />
                <Route path = "/createDebrief" element={<DebriefForm />} />
                <Route path = "/debriefs" element={<Debriefs />} />
                <Route path = "debrief/:id" element={<DebriefView />} />
                <Route path = "/updateDebrief/:id" element={<UpdateDebriefPage />} />
                <Route path = "/commander/:id" element={<CommanderPage />} />
                <Route path = "/group/update/:id" element={<UpdateGroup />} />
                <Route path = "/user/update/:id" element={<UpdateUser />} />
                <Route path = "/unauthorized" element={<Unauthorized />} />
                <Route path = "/debrief/delete" element={<DeleteDebriefById />} />
                <Route path = "/statistics" element={<StatisticsPage />} />
                </Route>
            </Routes>
        </Router>
)
