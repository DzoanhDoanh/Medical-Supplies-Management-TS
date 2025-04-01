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
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, Avatar } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useCurrentApp } from '../context/app.context';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

const { Content, Footer, Sider } = Layout;

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
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

    const items: MenuItem[] = [
        {
            label: <Link to="/admin">Bảng điều khiển</Link>,
            key: '/admin',
            icon: <AppstoreOutlined />,
        },
        {
            label: <Link to="/admin/category">Quản lý danh mục</Link>,
            key: '/admin/category',
            icon: <MenuFoldOutlined />,
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
            label: <Link to="/admin/department">Quản lý phòng ban</Link>,
            key: '/admin/department',
            icon: <DatabaseOutlined />,
        },

        {
            label: <Link to="/admin/supplies">Quản lý vật tư</Link>,
            key: '/admin/supplies',
            icon: <ExceptionOutlined />,
        },
        {
            label: <span>Duyệt đơn</span>,
            key: '/admin/material-request',
            icon: <EditOutlined />,
            children: [
                {
                    label: <Link to="/admin/material-request">Đơn yêu cầu</Link>,
                    key: '/admin/material-request',
                    icon: <EditOutlined />,
                },
                {
                    label: <Link to="/admin/material-buy-request">Đơn mua</Link>,
                    key: '/admin/material-buy-request',
                    icon: <EditOutlined />,
                },
            ],
        },
        {
            label: <Link to="/admin/material-export">Bàn giao vật tư</Link>,
            key: '/admin/material-export',
            icon: <ExceptionOutlined />,
        },
        {
            label: <Link to="/admin/material-import">Nhập vật tư</Link>,
            key: '/admin/material-import',
            icon: <ExceptionOutlined />,
        },
        {
            label: <Link to="/admin/material-import-list">Phiếu nhập</Link>,
            key: '/admin/material-import-list',
            icon: <ExceptionOutlined />,
        },
        {
            label: <Link to="/admin/material-report">Báo cáo</Link>,
            key: '/admin/material-report',
            icon: <ExceptionOutlined />,
        },
    ];

    const itemsDropdown = [
        {
            label: (
                <label style={{ cursor: 'pointer' }} onClick={() => alert('me')}>
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
                    <div style={{ height: 32, margin: 16, textAlign: 'center' }}>Admin</div>
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
                                    <Avatar src={`http://localhost:5173/src/assets/images/${user?.avatar}`} />
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
        </>
    );
};

export default LayoutAdmin;
