/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    HeartTwoTone,
    TeamOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DatabaseOutlined,
    EditOutlined,
    MergeCellsOutlined,
    LinkOutlined,
    MedicineBoxOutlined,
    ClusterOutlined,
    DeliveredProcedureOutlined,
    DownloadOutlined,
    ExportOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, Avatar } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useCurrentApp } from '../context/app.context';
import type { MenuProps } from 'antd';
import { FaPlusSquare } from 'react-icons/fa';
import ChangeInfo from '@/pages/admin/info.change';

type MenuItem = Required<MenuProps>['items'][number];

const { Content, Footer, Sider } = Layout;

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<IUser | null>(null);
    const { user, setUser, setIsAuthenticated, isAuthenticated } = useCurrentApp();
    const location = useLocation();
    useEffect(() => {
        const active: any = items.find((item) => location.pathname === (item!.key as any)) ?? '/admin';
        setActiveMenu(active.key);
    }, [location]);
    const handleLogout = async () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
    };
    let items: MenuItem[];
    if (user?.role === 'head') {
        items = [
            {
                label: <Link to="/admin">Bảng điều khiển</Link>,
                key: '/admin',
                icon: <AppstoreOutlined />,
            },

            {
                label: <span>Duyệt đơn</span>,
                key: '/admin/material-request',
                icon: <EditOutlined />,
                children: [
                    {
                        label: <Link to="/admin/material-request">Đơn cấp phát</Link>,
                        key: '/admin/material-request',
                        icon: <EditOutlined />,
                    },
                    {
                        label: <Link to="/admin/material-import-list">Duyệt đơn mua</Link>,
                        key: '/admin/material-import-list',
                        icon: <ExceptionOutlined />,
                    },
                ],
            },
            {
                label: <Link to="/admin/supplies">Danh sách vật tư</Link>,
                key: '/admin/supplies',
                icon: <MedicineBoxOutlined />,
            },
            {
                label: <Link to="/admin/material-import-list-detail">Danh sách nhập</Link>,
                key: '/admin/material-import-list-detail',
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/admin/hand-over-list">Đơn bàn giao</Link>,
                key: '/admin/hand-over-list',
                icon: <ScheduleOutlined />,
            },
            {
                label: <Link to="/admin/material-report">Báo cáo</Link>,
                key: '/admin/material-report',
                icon: <ScheduleOutlined />,
            },
        ];
    } else if (user?.role === 'manager') {
        items = [
            {
                label: <Link to="/admin">Bảng điều khiển</Link>,
                key: '/admin',
                icon: <AppstoreOutlined />,
            },
            {
                label: <Link to="/admin/category">Danh mục vật tư</Link>,
                key: '/admin/category',
                icon: <MenuFoldOutlined />,
            },
            {
                label: <Link to="/admin/manufacturer">Xuất xứ</Link>,
                key: '/admin/manufacturer',
                icon: <MergeCellsOutlined />,
            },
            {
                label: <Link to="/admin/unit">Đơn vị tính</Link>,
                key: '/admin/unit',
                icon: <LinkOutlined />,
            },
            {
                label: <Link to="/admin/supplies">Danh sách vật tư</Link>,
                key: '/admin/supplies',
                icon: <MedicineBoxOutlined />,
            },
            {
                label: <Link to="/admin/medical-supplies-request">Đề nghị cấp vật tư</Link>,
                key: '/admin/medical-supplies-request',
                icon: <DeliveredProcedureOutlined />,
            },
            {
                label: <Link to="/admin/hand-over">Bàn giao vật tư</Link>,
                key: '/admin/hand-over',
                icon: <ScheduleOutlined />,
            },
            {
                label: <Link to="/admin/hand-over-list">Đơn bàn giao</Link>,
                key: '/admin/hand-over-list',
                icon: <ScheduleOutlined />,
            },
            {
                label: <Link to="/admin/storage-detail">Kho</Link>,
                key: '/admin/storage-detail',
                icon: <ClusterOutlined />,
            },
            {
                label: <Link to="/admin/statiscal-storage">Thống kê</Link>,
                key: '/admin/statiscal-storage',
                icon: <ScheduleOutlined />,
            },
        ];
    } else {
        items = [
            {
                label: <Link to="/admin">Bảng điều khiển</Link>,
                key: '/admin',
                icon: <AppstoreOutlined />,
            },
            {
                label: <Link to="/admin/category">Danh mục vật tư</Link>,
                key: '/admin/category',
                icon: <MenuFoldOutlined />,
            },
            {
                label: <Link to="/admin/manufacturer">Xuất xứ</Link>,
                key: '/admin/manufacturer',
                icon: <MergeCellsOutlined />,
            },
            {
                label: <Link to="/admin/unit">Đơn vị tính</Link>,
                key: '/admin/unit',
                icon: <LinkOutlined />,
            },
            {
                label: <Link to="/admin/batch">Đợt cấp vật tư</Link>,
                key: '/admin/batch',
                icon: <ExportOutlined />,
            },
            {
                label: <span>Nhân viên</span>,
                key: '/admin/user',
                icon: <UserOutlined />,
                children: [
                    {
                        label: <Link to="/admin/user">Quản lý NV</Link>,
                        key: '/admin/user',
                        icon: <TeamOutlined />,
                    },
                    // {
                    //     label: 'Files1',
                    //     key: 'file1',
                    //     icon: <TeamOutlined />,
                    // }
                ],
            },
            {
                label: <Link to="/admin/supplies">Danh sách vật tư</Link>,
                key: '/admin/supplies',
                icon: <MedicineBoxOutlined />,
            },
            {
                label: <Link to="/admin/storage">Kho</Link>,
                key: '/admin/storage',
                icon: <ClusterOutlined />,
            },
            {
                label: <Link to="/admin/department">Phòng ban</Link>,
                key: '/admin/department',
                icon: <DatabaseOutlined />,
            },
            {
                label: <span>Đề nghị mua</span>,
                key: '/admin/material-import',
                icon: <DeliveredProcedureOutlined />,
                children: [
                    {
                        label: <Link to="/admin/material-import">Yêu cầu mua</Link>,
                        key: '/admin/material-import',
                        icon: <TeamOutlined />,
                    },
                    {
                        label: <Link to="/admin/material-import-list">Duyệt đơn</Link>,
                        key: '/admin/material-import-list',
                        icon: <ExceptionOutlined />,
                    },
                    {
                        label: <Link to="/admin/import">Nhập vật tư</Link>,
                        key: '/admin/import',
                        icon: <DownloadOutlined />,
                    },
                    {
                        label: <Link to="/admin/material-import-list-detail">Danh sách nhập</Link>,
                        key: '/admin/material-import-list-detail',
                        icon: <ExceptionOutlined />,
                    },
                ],
            },
            {
                label: <Link to="/admin/medical-supplies-request">Đề nghị cấp vật tư</Link>,
                key: '/admin/medical-supplies-request',
                icon: <DeliveredProcedureOutlined />,
            },
            {
                label: <span>Cấp phát vật tư</span>,
                key: '/admin/material-request',
                icon: <EditOutlined />,
                children: [
                    {
                        label: <Link to="/admin/material-request">Đơn cấp phát</Link>,
                        key: '/admin/material-request',
                        icon: <EditOutlined />,
                    },
                    {
                        label: <Link to="/admin/material-export">Cấp phát về kho</Link>,
                        key: '/admin/material-export',
                        icon: <ExportOutlined />,
                    },
                    {
                        label: <Link to="/admin/hand-over">Bàn giao vật tư</Link>,
                        key: '/admin/hand-over',
                        icon: <ScheduleOutlined />,
                    },
                    {
                        label: <Link to="/admin/hand-over-list">Đơn bàn giao</Link>,
                        key: '/admin/hand-over-list',
                        icon: <ScheduleOutlined />,
                    },
                ],
            },
            {
                label: <Link to="/admin/material-report">Báo cáo</Link>,
                key: '/admin/material-report',
                icon: <ScheduleOutlined />,
            },
        ];
    }

    const itemsDropdown = [
        {
            label: (
                <label
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setOpenModalUpdate(true);
                        setDataUpdate(user);
                    }}
                >
                    Quản lý tài khoản
                </label>
            ),
            key: 'account',
        },
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: (
                <label style={{ cursor: 'pointer' }} onClick={() => handleLogout()}>
                    Đăng xuất
                </label>
            ),
            key: 'logout',
        },
    ];

    return (
        <>
            <Layout style={{ minHeight: '100vh' }} className="layout-admin">
                <Sider theme="light" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div className="logo" style={{ height: 32, margin: 16, display: 'flex', alignItems: 'center' }}>
                        <FaPlusSquare className="icon-react" style={{ color: '#0dcaf0' }}></FaPlusSquare>
                        <span style={{ marginLeft: '16px' }}>Vật tư y tế</span>
                    </div>
                    <Menu
                        // defaultSelectedKeys={[activeMenu]}
                        selectedKeys={[activeMenu]}
                        mode="inline"
                        items={items}
                        onClick={(e) => setActiveMenu(e.key)}
                    />
                </Sider>
                <Layout>
                    <div
                        className="admin-header"
                        style={{
                            height: '50px',
                            borderBottom: '1px solid #ebebeb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 15px',
                        }}
                    >
                        <span>
                            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: () => setCollapsed(!collapsed),
                            })}
                        </span>
                        {isAuthenticated === true ? (
                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space style={{ cursor: 'pointer' }}>
                                    {user && user.avatar.length > 50 ? (
                                        <Avatar src={`${user?.avatar}`} />
                                    ) : (
                                        <Avatar src={`http://localhost:5173/src/assets/images/${user?.avatar}`} />
                                    )}
                                    {user?.fullName}
                                </Space>
                            </Dropdown>
                        ) : (
                            ''
                        )}
                    </div>
                    <Content style={{ padding: '15px' }}>
                        <Outlet />
                    </Content>
                    <Footer style={{ padding: 0, textAlign: 'center' }}>
                        Medical Supplies Management &copy; Doanh - Made with <HeartTwoTone />
                    </Footer>
                </Layout>
            </Layout>
            <ChangeInfo
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
        </>
    );
};

export default LayoutAdmin;
