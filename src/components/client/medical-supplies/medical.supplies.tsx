import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Tag, Button, Pagination, Tabs, Empty } from 'antd';
import image from 'assets/images/thumbnailMaterial.png';
import { getCategoryApi, getSuppliesApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MedicalSuppliesList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all');
    const [materials, setMaterials] = useState<ISupplies[]>([]);
    const [category, setCategory] = useState<ICategory[]>([]);
    const navigate = useNavigate();
    const pageSize = 8;
    console.log(activeTab);

    useEffect(() => {
        const fetchData = async () => {
            const fetchMaterials = await getSuppliesApi('');
            const fetchCategory = await getCategoryApi();
            if (fetchMaterials && fetchMaterials.data) {
                setMaterials(fetchMaterials.data);
            }
            if (fetchCategory && fetchCategory.data) {
                setCategory(fetchCategory.data);
            }
        };
        fetchData();
    }, []);
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const filteredData = activeTab === 'all' ? materials : materials.filter((item) => item.categoryId === activeTab);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div style={{ padding: '30px', backgroundColor: '#fff' }}>
            <Title level={2} style={{ textAlign: 'center', color: '#61dafb' }}>
                Danh sách vật tư
            </Title>
            <Tabs defaultActiveKey="all" onChange={setActiveTab} centered>
                <TabPane tab="Tất cả vật tư" key="all" />
                {category.map((item) => {
                    return <TabPane tab={item.categoryName} key={item.id} />;
                })}
            </Tabs>
            <Row gutter={[16, 16]} justify="start">
                {paginatedData.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                ) : (
                    paginatedData.map((item) => (
                        <Col xs={12} sm={8} md={6} lg={4} key={item.id}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    textAlign: 'center',
                                    fontSize: '12px',
                                }}
                                cover={
                                    <img
                                        alt={item.name}
                                        src={image}
                                        style={{
                                            height: 120,
                                            objectFit: 'contain',
                                            borderTopLeftRadius: '10px',
                                            borderTopRightRadius: '10px',
                                        }}
                                    />
                                }
                            >
                                <Title level={5} style={{ color: '#333', fontSize: '14px' }}>
                                    {item.name}
                                </Title>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {category.find((e) => e.id === item.categoryId)?.categoryName}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '12px' }}>Số lượng: {item.quantity}</Text>
                                <br />
                                <Tag style={{ marginTop: '12px' }} color={item.status === 0 ? 'red' : 'green'}>
                                    {item.status === 0 ? 'Hết' : 'Tốt'}
                                </Tag>
                                <br />
                                <br />
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ backgroundColor: '#61dafb', borderColor: '#52c41a' }}
                                    onClick={() => navigate(`/medical-supply/${item.id}`)}
                                >
                                    Xem chi tiết
                                </Button>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Pagination
                    current={currentPage}
                    total={filteredData.length}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

export default MedicalSuppliesList;
