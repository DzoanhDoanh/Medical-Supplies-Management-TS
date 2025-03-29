import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App, ConfigProvider } from 'antd';
import Layout from './layout';
import BookPage from './pages/client/book';
import AboutPage from './pages/client/about';
import RegisterPage from './pages/client/auth/register';
import './styles/global.scss';
import HomePage from './pages/client/home';
import { AppProvider } from './components/context/app.context';
import ProtectedRoute from './components/auth/auth';
import LayoutAdmin from './components/layout/layout.admin';
import DashBoardPage from './pages/admin/dashboard';
import ManageUserPage from './pages/admin/manage.user';
import Login from './pages/client/auth/login';
import enUS from 'antd/locale/en_US';
import UserProfile from './pages/client/user.profile';
import TableDepartment from './components/admin/department/table.department';
import TableCategory from './components/admin/category/table.category';
import ManageSuppliesPage from './pages/admin/manage.supplies';
// import vie from 'antd/locale/vi_VN';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/book/:id',
                element: (
                    <ProtectedRoute>
                        <BookPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/account/:id',
                element: (
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/about',
                element: <AboutPage />,
            },
            {
                path: '/required-buy-supplies',
                element: (
                    <ProtectedRoute>
                        <div>required-buy-supplies</div>
                    </ProtectedRoute>
                ),
            },
            {
                path: '/required-supplies',
                element: (
                    <ProtectedRoute>
                        <div>required-supplies</div>
                    </ProtectedRoute>
                ),
            },
            {
                path: '/medical-supplies-detail',
                element: (
                    <ProtectedRoute>
                        <div>medical-supplies-detail</div>
                    </ProtectedRoute>
                ),
            },
            {
                path: '/medical-supplies-report',
                element: (
                    <ProtectedRoute>
                        <div>medical-supplies-report</div>
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: 'admin',
        element: <LayoutAdmin />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <DashBoardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'supplies',
                element: (
                    <ProtectedRoute>
                        <ManageSuppliesPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'department',
                element: (
                    <ProtectedRoute>
                        <TableDepartment />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'category',
                element: (
                    <ProtectedRoute>
                        <TableCategory />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'user',
                element: (
                    <ProtectedRoute>
                        <ManageUserPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/admin',
                element: (
                    <ProtectedRoute>
                        <div>admin page</div>
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App>
            <AppProvider>
                <ConfigProvider locale={enUS}>
                    <RouterProvider router={router} />
                </ConfigProvider>
            </AppProvider>
        </App>
    </StrictMode>,
);
