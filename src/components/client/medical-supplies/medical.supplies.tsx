/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
    Layout,
    Tabs,
    Pagination,
    Row,
    Col,
    Divider,
    Grid,
    Button,
    Drawer,
    Form,
    Checkbox,
    InputNumber,
    Rate,
    FormProps,
    Spin,
    Empty,
} from 'antd';
import { BookOutlined, FireOutlined, FilterOutlined, FilterTwoTone, ReloadOutlined } from '@ant-design/icons';
import image from '../../../assets/images/thumbnailbook.jpg';
import '../../../styles/home.scss';
import CurrencyFormatter from '@/components/currencyFormatter/currency.formatter';
import { getBooksApi, getCategoryApi } from '@/services/api';
import { useNavigate, useOutletContext } from 'react-router-dom';

const { Content } = Layout;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const SupplyDetail = () => {
    const [searchTerm] = useOutletContext() as any;
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterVisible, setFilterVisible] = useState(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [lstBookData, setLstBookData] = useState<IBook[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isTabletOrMobile = !screens.lg;

    const pageSize = 4;

    useEffect(() => {
        fetchBookData();
    }, [activeTab, searchTerm]);

    const fetchBookData = async () => {
        try {
            setLoading(true);
            form.resetFields();
            if (activeTab === 'all') {
                let query = '';
                if (searchTerm) {
                    query += `&mainText_like=${searchTerm}`;
                }
                const bookData = await getBooksApi(query);
                const categoryData = await getCategoryApi();
                if (bookData && bookData.data) {
                    setLstBookData(bookData.data);
                }
                if (categoryData && categoryData.data) {
                    setCategories(categoryData.data);
                }

                setLoading(false);
            } else {
                let query = '';
                if (searchTerm) {
                    query += `&mainText_like=${searchTerm}`;
                }
                const bookData = await getBooksApi(`_limit=8&_sort=${activeTab}&_order=desc${query}`);
                const categoryData = await getCategoryApi();
                if (bookData && bookData.data) {
                    setLstBookData(bookData.data);
                }
                if (categoryData && categoryData.data) {
                    setCategories(categoryData.data);
                }
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };
    const handleChangeFilter = (changedValues: any, values: any) => {
        console.log(changedValues, values);
    };
    const onFinish: FormProps['onFinish'] = async (values) => {
        setLoading(true);
        if (values.category === undefined && values.range.from === undefined && values.range.to === undefined) {
            setLoading(false);
            return;
        }
        let query = '';
        if (values.category.length > 0) {
            for (const item of values.category) {
                query += '&category=' + item;
            }
        }
        if (values.range && values.range.from && values.range.to) {
            query += `&price_gte=${values.range.from}&price_lte=${values.range.to}`;
        }
        if (activeTab === 'all') {
            const res = await getBooksApi(query);
            if (res && res.data) {
                setLstBookData(res.data);
                setLoading(false);
            }
        } else {
            const res = await getBooksApi(`_limit=8&_sort=${activeTab}&_order=desc${query}`);
            if (res && res.data) {
                setLstBookData(res.data);
                setLoading(false);
            }
            setLoading(false);
        }
        setLoading(false);
    };

    const paginatedBooks = lstBookData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const FilterContent = (
        <div style={{ padding: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                    <FilterTwoTone /> Bộ lọc tìm kiếm
                </span>
                <ReloadOutlined
                    title="Reset"
                    style={{ cursor: 'pointer' }}
                    onClick={async () => {
                        form.resetFields();
                        setLoading(true);

                        // Nếu đang ở tab "all"
                        if (activeTab === 'all') {
                            const bookData = await getBooksApi('');
                            if (bookData && bookData.data) {
                                setLstBookData(bookData.data);
                            }
                        } else {
                            const bookData = await getBooksApi(`_limit=8&_sort=${activeTab}&_order=desc`);
                            if (bookData && bookData.data) {
                                setLstBookData(bookData.data);
                            }
                        }

                        setLoading(false);
                    }}
                />
            </div>
            <Divider />
            <Form
                onFinish={onFinish}
                form={form}
                onValuesChange={(changedValues, values) => handleChangeFilter(changedValues, values)}
            >
                <Form.Item label="Danh mục sản phẩm" name="category" labelCol={{ span: 24 }}>
                    <Checkbox.Group>
                        <Row gutter={[0, 12]}>
                            {categories &&
                                categories.map((item) => {
                                    return (
                                        <Col key={item.id} span={24}>
                                            <Checkbox value={item.categoryName}>{item.categoryName}</Checkbox>
                                        </Col>
                                    );
                                })}
                        </Row>
                    </Checkbox.Group>
                </Form.Item>
                <Divider />
                <Form.Item label={'Khoảng giá'} labelCol={{ span: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Form.Item name={['range', 'from']}>
                            <InputNumber
                                name="from"
                                placeholder="Từ"
                                min={0}
                                style={{ width: '100%' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                        <span style={{ margin: '0 5px' }}></span>
                        <Form.Item name={['range', 'to']}>
                            <InputNumber
                                name="to"
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="Đến"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                    </div>
                    <div>
                        <Button onClick={() => form.submit()} style={{ width: '100%' }} type="primary">
                            Áp dụng
                        </Button>
                    </div>
                </Form.Item>
                <Divider />
                <Form.Item label="Đánh giá" labelCol={{ span: 24 }}>
                    <div>
                        <Rate value={5} disabled style={{ color: '#ffce3d' }}></Rate>
                        <span className="ant-rate-text"></span>
                    </div>
                    <div>
                        <Rate value={4} disabled style={{ color: '#ffce3d' }}></Rate>
                        <span className="ant-rate-text"> trở lên</span>
                    </div>
                    <div>
                        <Rate value={3} disabled style={{ color: '#ffce3d' }}></Rate>
                        <span className="ant-rate-text"> trở lên</span>
                    </div>
                    <div>
                        <Rate value={2} disabled style={{ color: '#ffce3d' }}></Rate>
                        <span className="ant-rate-text"> trở lên</span>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh', padding: 24, background: '#f0f2f5' }}>
            {isTabletOrMobile && (
                <div style={{ marginBottom: 16 }}>
                    <Button icon={<FilterOutlined />} onClick={() => setFilterVisible(true)}>
                        Bộ lọc
                    </Button>
                </div>
            )}

            <Drawer
                title="Bộ lọc sách"
                placement="left"
                closable
                onClose={() => setFilterVisible(false)}
                open={filterVisible}
                width={300}
            >
                {FilterContent}
            </Drawer>

            <Layout hasSider style={{ position: 'relative' }}>
                {!isTabletOrMobile && (
                    <div
                        style={{
                            width: 300,
                            background: '#ffffff',
                            padding: 24,
                            marginRight: 24,
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {FilterContent}
                    </div>
                )}

                <Content
                    style={{
                        background: '#ffffff',
                        padding: 24,
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        flex: 1,
                    }}
                >
                    <Tabs
                        defaultActiveKey="all"
                        onChange={(key) => {
                            setActiveTab(key);
                            setCurrentPage(1);
                        }}
                    >
                        <TabPane
                            tab={
                                <>
                                    <BookOutlined /> Tất cả sách
                                </>
                            }
                            key="all"
                        />
                        <TabPane
                            tab={
                                <>
                                    <FireOutlined /> Sách bán chạy
                                </>
                            }
                            key="sold"
                        />
                    </Tabs>
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }} className="customize-row">
                        {loading ? (
                            <Col span={24} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Spin fullscreen></Spin>
                            </Col>
                        ) : lstBookData.length === 0 ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                }}
                            >
                                <Empty description="Không có sản phẩm nào" />
                            </div>
                        ) : (
                            paginatedBooks.map((book) => (
                                <Col
                                    key={book.id}
                                    span={6}
                                    md={6}
                                    xs={12}
                                    className="book-card column"
                                    onClick={() => navigate(`/book/${book.id}`)}
                                >
                                    <div className="wrapper" style={{ border: '1px solid #f5f5f5', padding: 16 }}>
                                        <div className="thumbnail">
                                            <img
                                                src={image}
                                                alt={book.mainText}
                                                style={{ width: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="text">{book.mainText}</div>
                                        <div className="price">
                                            <CurrencyFormatter value={book.price} />
                                        </div>
                                        <div className="rating">
                                            <Rate value={5} disabled style={{ color: '#ffce3d', fontSize: 14 }} />
                                            <span> Đã bán {book.sold}</span>
                                        </div>
                                    </div>
                                </Col>
                            ))
                        )}
                    </Row>
                    <div style={{ marginTop: 32, textAlign: 'center', position: 'absolute', bottom: '5px' }}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={lstBookData.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default SupplyDetail;
