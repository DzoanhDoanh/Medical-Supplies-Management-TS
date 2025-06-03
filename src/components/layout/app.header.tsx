/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaPlusSquare } from 'react-icons/fa';
import { Divider, Drawer, Avatar, App, Menu } from 'antd';
import { Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router';
import './app.header.scss';
import { Link } from 'react-router-dom';
import { useCurrentApp } from 'components/context/app.context';
import { useEffect, useState } from 'react';
import {
    ApartmentOutlined,
    LoginOutlined,
    LogoutOutlined,
    SnippetsOutlined,
} from '@ant-design/icons';
import ChangeInfo from '@/pages/admin/info.change';
import { AutoComplete, Input } from 'antd';
import type { AutoCompleteProps } from 'antd';
import { getSuppliesApi } from '@/services/api';

const AppHeader = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<IUser | null>(null);
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [materials, setMaterials] = useState<ISupplies[]>([]);

    const { message } = App.useApp();

    const { isAuthenticated, user, setUser, setIsAuthenticated } = useCurrentApp();

    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            const res = await getSuppliesApi('');
            if (res && res.data) {
                setMaterials(res.data);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
        message.success('Đăng xuất thành công!');
        navigate('/login');
    };
    const handleSearch = async (value: string) => {
        if (!value) {
            setOptions([]);
            return;
        }

        try {
            const response = await getSuppliesApi(`&name_like=${value}`);
            if (response && response.data) {
                const formattedData = response.data.map((item: any) => ({
                    value: item.name,
                }));
                setOptions(formattedData);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };
    const onSelect = (value: string) => {
        const material = materials.find((e) => e.name === value);
        navigate(`/medical-supply/${material?.id ?? ''}`);
    };
    // eslint-disable-next-line prefer-const
    let items = [
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
            label: (
                <label style={{ cursor: 'pointer' }} onClick={() => handleLogout()}>
                    Đăng xuất
                </label>
            ),
            key: 'logout',
        },
    ];
    if (user?.role === 'admin' || user?.role === 'head' || user?.role === 'manager') {
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
                        <div className="page-header__logo" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="logo" style={{ color: '#fff' }}>
                                <span onClick={() => navigate('/')}>
                                    {' '}
                                    <FaPlusSquare className="icon-react"></FaPlusSquare>
                                    Vật tư y tế
                                </span>

                                {/* <VscSearchFuzzy className="icon-search" style={{ color: '#000' }} /> */}
                            </span>
                            <AutoComplete
                                // popupMatchSelectWidth={500}
                                style={{ width: '80%' }}
                                options={options}
                                onSelect={onSelect}
                                onSearch={handleSearch}
                                size="middle"
                            >
                                <Input.Search size="middle" placeholder="Tìm kiếm vật tư" enterButton />
                            </AutoComplete>
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
                                            {user && user.avatar.length > 10 ? (
                                                <Avatar src={`${user?.avatar}`} />
                                            ) : (
                                                <Avatar
                                                    src={`http://localhost:5173/src/assets/images/${user?.avatar}`}
                                                />
                                            )}
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
                            <Menu.Item key="1" icon={<SnippetsOutlined />}>
                                <Link to="/">Thống kê vật tư</Link>
                            </Menu.Item>
                            {/* <Menu.Item key="2" icon={<PayCircleOutlined />}>
                                <Link to="/required-buy-supplies">Đề nghị mua vật tư</Link>
                            </Menu.Item> */}
                            {/* <Menu.Item key="3" icon={<AppstoreAddOutlined />}>
                                <Link to="/return-materials">Tạo phiếu trả vật tư</Link>
                            </Menu.Item> */}
                            <Menu.Item key="2" icon={<ApartmentOutlined />}>
                                <Link to="/print">In biên bản giao nhận vật tư</Link>
                            </Menu.Item>
                            <Menu.Item key="4" icon={<ApartmentOutlined />}>
                                <Link to="/medical-supplies-detail">Chi tiết vật tư</Link>
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
            <ChangeInfo
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
        </>
    );
};

export default AppHeader;
