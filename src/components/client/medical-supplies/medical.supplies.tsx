import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Tag, Button, Pagination, Empty, Select } from 'antd';
import image from 'assets/images/thumbnailMaterial.png';
import { getCategoryApi, getSuppliesApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const MedicalSuppliesList: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [materials, setMaterials] = useState<ISupplies[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const navigate = useNavigate();
    const pageSize = 4;

    useEffect(() => {
        const fetchData = async () => {
            const fetchMaterials = await getSuppliesApi('');
            const fetchCategories = await getCategoryApi();
            if (fetchMaterials && fetchMaterials.data) {
                setMaterials(fetchMaterials.data);
            }
            if (fetchCategories && fetchCategories.data) {
                setCategories(fetchCategories.data);
            }
        };
        fetchData();
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCategoryChange = (value: string) => {
        setActiveCategory(value);
        setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi danh mục
    };

    const filteredData =
        activeCategory === 'all' ? materials : materials.filter((item) => item.categoryId === activeCategory);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div style={{ padding: '30px', backgroundColor: '#fff' }}>
            <Title level={2} style={{ textAlign: 'center', color: '#61dafb' }}>
                Quản lý vật tư y tế
            </Title>
            <Row gutter={[16, 16]}>
                {/* Cột 1: Danh mục */}
                <Col xs={24} sm={8} lg={6}>
                    <div style={{ padding: '16px', backgroundColor: '#61dafb', borderRadius: '10px' }}>
                        <Title level={4} style={{ color: '#fff' }}>
                            Danh mục
                        </Title>
                        <Select value={activeCategory} onChange={handleCategoryChange} style={{ width: '100%' }}>
                            <Option value="all">Tất cả vật tư</Option>
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.categoryName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </Col>

                {/* Cột 2: Danh sách vật tư */}
                <Col xs={24} sm={16} lg={18}>
                    <Row gutter={[16, 16]} justify="start">
                        {paginatedData.length === 0 ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                }}
                            >
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                        ) : (
                            paginatedData.map((item) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
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
                                            {categories.find((e) => e.id === item.categoryId)?.categoryName}
                                        </Text>
                                        <br />
                                        <Text style={{ fontSize: '12px' }}>Xuất xứ: {item.manufacturer}</Text>
                                        <br />
                                        <Tag style={{ marginTop: '12px' }} color={'green'}>
                                            {item.unit}
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
                </Col>
            </Row>
        </div>
    );
};

export default MedicalSuppliesList;
