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
import ManageBookPage from './pages/admin/manage.book';
import ManageOrderPage from './pages/admin/manage.order';
import ManageUserPage from './pages/admin/manage.user';
import Login from './pages/client/auth/login';
import enUS from 'antd/locale/en_US';
import OrderPage from './pages/client/order';
import UserProfile from './pages/client/user.profile';
import History from './components/client/history/history';
// import vie from 'antd/locale/vi_VN';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: '/book/:id',
                element: <BookPage />,
            },
            {
                path: '/order',
                element: (
                    <ProtectedRoute>
                        <OrderPage />
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
                path: '/checkout',
                element: (
                    <ProtectedRoute>
                        <div>checkout page</div>
                    </ProtectedRoute>
                ),
            },
            {
                path: '/history',
                element: (
                    <ProtectedRoute>
                        <History />
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
                path: 'book',
                element: (
                    <ProtectedRoute>
                        <ManageBookPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'order',
                element: (
                    <ProtectedRoute>
                        <ManageOrderPage />
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
