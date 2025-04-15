import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App, ConfigProvider } from 'antd';
import Layout from './layout';
import Material from './pages/client/material.detail';
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
import ManageSuppliesPage from './pages/admin/manage.supplies';
import MedicalSuppliesPage from './pages/client/medical.supplies';
import ManageCategory from './pages/admin/manage.category';
import ManageDepartment from './pages/admin/manage.department';
import MedicalSuppliesRequest from './pages/client/request.supplies';
import ManageMaterialRequest from './pages/admin/manage.material.request';
import ExportMaterial from './pages/admin/export.material';
import ImportMaterial from './pages/admin/import.material';
import ImportList from './pages/admin/material.import.list';
import MaterialStatisticsReport from './pages/admin/report';
import ManageManufacturer from './pages/admin/manage.manufacturer';
import ManageUnit from './pages/admin/manage.unit';
import ManageStorage from './pages/admin/manage.storage';
import Import from './components/admin/import/import';
import ManageBatch from './pages/admin/manage.batch';
import ManageHandOver from './pages/admin/manage.hand.over';
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
                path: '/medical-supply/:id',
                element: (
                    <ProtectedRoute>
                        <Material />
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
                path: '/medical-supplies-request',
                element: (
                    <ProtectedRoute>
                        <MedicalSuppliesRequest />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/medical-supplies-detail',
                element: (
                    <ProtectedRoute>
                        <MedicalSuppliesPage />
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
                        <ManageDepartment />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'category',
                element: (
                    <ProtectedRoute>
                        <ManageCategory />
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
                path: 'material-request',
                element: (
                    <ProtectedRoute>
                        <ManageMaterialRequest />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'material-export',
                element: (
                    <ProtectedRoute>
                        <ExportMaterial />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'material-buy-request',
                element: (
                    <ProtectedRoute>
                        <div>Đơn đề nghị mua thêm</div>
                    </ProtectedRoute>
                ),
            },
            {
                path: 'material-import',
                element: (
                    <ProtectedRoute>
                        <ImportMaterial />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'material-import-list',
                element: (
                    <ProtectedRoute>
                        <ImportList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'material-report',
                element: (
                    <ProtectedRoute>
                        <MaterialStatisticsReport />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'manufacturer',
                element: (
                    <ProtectedRoute>
                        <ManageManufacturer />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'unit',
                element: (
                    <ProtectedRoute>
                        <ManageUnit />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'storage',
                element: (
                    <ProtectedRoute>
                        <ManageStorage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'import',
                element: (
                    <ProtectedRoute>
                        <Import />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'medical-supplies-request',
                element: (
                    <ProtectedRoute>
                        <MedicalSuppliesRequest />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'batch',
                element: (
                    <ProtectedRoute>
                        <ManageBatch />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'hand-over',
                element: (
                    <ProtectedRoute>
                        <ManageHandOver />
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
