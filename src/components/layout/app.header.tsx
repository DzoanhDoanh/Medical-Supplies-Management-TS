import { FaPlusSquare } from 'react-icons/fa';
import { VscSearchFuzzy } from 'react-icons/vsc';
import { Divider, Drawer, Avatar, App, Menu } from 'antd';
import { Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router';
import './app.header.scss';
import { Link } from 'react-router-dom';
import { useCurrentApp } from 'components/context/app.context';
import { useState } from 'react';
import {
    ApartmentOutlined,
    AppstoreAddOutlined,
    LoginOutlined,
    LogoutOutlined,
    PayCircleOutlined,
    SnippetsOutlined,
    UserOutlined,
} from '@ant-design/icons';

interface IProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
}
const AppHeader = (props: IProps) => {
    const [openDrawer, setOpenDrawer] = useState(false);

    const { message } = App.useApp();

    const { isAuthenticated, user, setUser, setIsAuthenticated } = useCurrentApp();

    const navigate = useNavigate();
    const handleLogout = async () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
        message.success('Đăng xuất thành công!');
        navigate('/login');
    };
    // eslint-disable-next-line prefer-const
    let items = [
        {
            label: (
                <label style={{ cursor: 'pointer' }} onClick={() => navigate('/account/1')}>
                    Quản lý tài khoản
                </label>
            ),
            key: 'account',
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
    if (user?.role === 'admin') {
        items.unshift({
            label: <Link to="/admin">Trang quản trị</Link>,
            key: 'admin',
        });
    }

    return (
        <>
            <div className="header-container">
                <header className="page-header">
                    <div className="page-header__top">
                        <div
                            className="page-header__toggle"
                            onClick={() => {
                                setOpenDrawer(true);
                            }}
                            style={{ color: '#fff', marginRight: '16px', fontSize: '20px', cursor: 'pointer' }}
                        >
                            ☰
                        </div>
                        <div className="page-header__logo">
                            <span className="logo" style={{ color: '#fff' }}>
                                <span onClick={() => navigate('/')}>
                                    {' '}
                                    <FaPlusSquare className="icon-react"></FaPlusSquare>
                                    Vật tư y tế
                                </span>

                                <VscSearchFuzzy className="icon-search" style={{ color: '#000' }} />
                            </span>
                            <input
                                className="input-search"
                                type={'text'}
                                placeholder="Tìm kiếm vật tư"
                                value={props.searchTerm}
                                onChange={(e) => props.setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <nav className="page-header__bottom">
                        <ul id="navigation" className="navigation">
                            <li className="navigation__item mobile">
                                <Divider type="vertical" />
                            </li>
                            <li className="navigation__item mobile">
                                {!isAuthenticated ? (
                                    <span
                                        onClick={() => navigate('/login')}
                                        style={{
                                            color: '#000',
                                            backgroundColor: '#fff',
                                            padding: '6px 12px',
                                            borderRadius: '25px',
                                        }}
                                    >
                                        {' '}
                                        Tài Khoản
                                    </span>
                                ) : (
                                    <Dropdown menu={{ items }} trigger={['click']}>
                                        <Space style={{ color: '#fff' }}>
                                            <Avatar src={`http://localhost:5173/src/assets/images/${user?.avatar}`} />
                                            {user?.fullName}
                                        </Space>
                                    </Dropdown>
                                )}
                            </li>
                        </ul>
                    </nav>
                </header>
            </div>
            <Drawer title="Menu chức năng" placement="left" onClose={() => setOpenDrawer(false)} open={openDrawer}>
                <Menu mode="vertical">
                    {isAuthenticated ? (
                        <>
                            <Menu.Item key="1" icon={<UserOutlined />}>
                                <Link to="/">Dashboard</Link>
                            </Menu.Item>
                            <Menu.Item key="2" icon={<PayCircleOutlined />}>
                                <Link to="/required-buy-supplies">Đề nghị mua vật tư</Link>
                            </Menu.Item>
                            <Menu.Item key="3" icon={<AppstoreAddOutlined />}>
                                <Link to="/medical-supplies-request">Đề nghị cung cấp vật tư</Link>
                            </Menu.Item>
                            <Menu.Item key="4" icon={<ApartmentOutlined />}>
                                <Link to="/medical-supplies-detail">Chi tiết vật tư</Link>
                            </Menu.Item>
                            <Menu.Item key="5" icon={<SnippetsOutlined />}>
                                <Link to="/medical-supplies-report">Thống kê vật tư</Link>
                            </Menu.Item>
                            <Menu.Item key="6" icon={<LogoutOutlined />} danger onClick={handleLogout}>
                                Đăng xuất
                            </Menu.Item>
                        </>
                    ) : (
                        <Menu.Item key="4" icon={<LoginOutlined />} danger onClick={() => navigate('/login')}>
                            Đăng Nhập
                        </Menu.Item>
                    )}
                </Menu>
            </Drawer>
        </>
    );
};

export default AppHeader;
