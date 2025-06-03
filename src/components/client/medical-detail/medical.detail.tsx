/* eslint-disable @typescript-eslint/no-unused-vars */
import { Row, Col, Typography, Rate, Tag, Button, InputNumber, Card, Image, Spin, Input, DatePicker } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import image from 'assets/images/thumbnailMaterial.png';
import { getCategoryApi } from '@/services/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface IProps {
    currentMaterial: ISupplies | undefined;
}
const MaterialDetail = ({ currentMaterial }: IProps) => {
    const [currentQuantity, setCurrentQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [category, setCategory] = useState<ICategory[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const res = await getCategoryApi();
            if (res && res.data) {
                setCategory(res.data);
            }
        };
        fetchData();
    }, [currentMaterial]);
    const isExpired = (expiryDateString: string): boolean => {
        const expiryDate = new Date(expiryDateString);
        const currentDate = new Date();
        return currentDate >= expiryDate; // True nếu đã hết hạn, False nếu còn hạn
    };
    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 0' }}>
            {loading ? (
                <Spin fullscreen></Spin>
            ) : (
                <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: 24 }}>
                    <Row gutter={[32, 32]} align="top">
                        <Col xs={18} md={8}>
                            <img
                                src={
                                    currentMaterial &&
                                    currentMaterial.thumbnail &&
                                    currentMaterial.thumbnail != 'user.png'
                                        ? `http://localhost:5173/src/assets/images/${currentMaterial?.thumbnail}`
                                        : image
                                }
                                alt="Vat tu"
                                style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                            />
                        </Col>
                        <Col xs={0} md={1}></Col>
                        <Col xs={24} md={14}>
                            <a
                                href="#"
                                onClick={() => navigate('/medical-supplies-detail')}
                                style={{ display: 'inline-block', marginBottom: 16 }}
                            >
                                <ArrowLeftOutlined /> Quay lại danh sách
                            </a>
                            <Title level={5} style={{ color: '#333', textAlign: 'center' }}>
                                {currentMaterial?.name}
                            </Title>
                            <div>
                                <b>Loại vật tư:</b>
                                <Input
                                    value={category.find((e) => e.id === currentMaterial?.categoryId)?.categoryName}
                                    readOnly
                                    style={{ margin: '5px 0' }}
                                />
                            </div>
                            <div>
                                <b>Mô tả:</b>{' '}
                                <Input value={currentMaterial?.desc} readOnly style={{ margin: '5px 0' }} />
                            </div>
                            <div>
                                <b>Đơn vị tính:</b>{' '}
                                <Input value={currentMaterial?.unit} readOnly style={{ margin: '5px 0' }} />
                            </div>
                            <div>
                                <b>Xuất xứ:</b>{' '}
                                <Input value={currentMaterial?.manufacturer} readOnly style={{ margin: '5px 0' }} />
                            </div>
                            <div>
                                <b>Hạn sử dụng:</b>{' '}
                                {currentMaterial?.expirationDate === '2003-12-16T17:00:00.000Z' ? (
                                    <div
                                        style={{
                                            backgroundColor: 'green',
                                            width: '60px',
                                            padding: '5px 12px',
                                            color: '#fff',
                                        }}
                                    >
                                        Không có
                                    </div>
                                ) : (
                                    <DatePicker
                                        value={dayjs(currentMaterial?.expirationDate)}
                                        format={'DD-MM-YYYY'}
                                        readOnly
                                        disabled
                                        style={{ width: '100%', margin: '5px 0' }}
                                    />
                                )}
                            </div>
                            <div>
                                <b>Trạng thái:</b>{' '}
                                {currentMaterial?.expirationDate === '2003-12-16T17:00:00.000Z' ? (
                                    <Tag style={{ marginTop: '12px' }} color={'green'}>
                                        Còn hạn sử dụng
                                    </Tag>
                                ) : (
                                    <Tag
                                        style={{ marginTop: '12px' }}
                                        color={isExpired(currentMaterial?.expirationDate ?? '') ? 'red' : 'green'}
                                    >
                                        {isExpired(currentMaterial?.expirationDate ?? '')
                                            ? 'Hết hạn sử dụng'
                                            : 'Còn hạn sử dụng'}
                                    </Tag>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}
        </div>
    );
};

export default MaterialDetail;
