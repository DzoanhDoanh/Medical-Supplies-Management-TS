import React from 'react';
import { Card, Col, Row, Statistic, Typography, Table } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

// Fake data
const stats = [
    { title: 'Tổng đơn hàng', value: 128, icon: <ShoppingCartOutlined />, color: '#1890ff' },
    { title: 'Tổng doanh thu', value: 158000000, icon: <DollarCircleOutlined />, color: '#52c41a', isCurrency: true },
    { title: 'Khách hàng', value: 92, icon: <UserOutlined />, color: '#faad14' },
    { title: 'Đơn hoàn tất', value: 102, icon: <CheckCircleOutlined />, color: '#13c2c2' },
];

const columns = [
    { title: 'Mã đơn hàng', dataIndex: 'id', key: 'id' },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Ngày đặt', dataIndex: 'date', key: 'date' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', render: (val: number) => `${val.toLocaleString()} VND` },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
];

const recentOrders = [
    { id: 'DH00128', customer: 'Nguyễn Văn A', date: '2025-03-20', total: 420000, status: 'Đã giao' },
    { id: 'DH00127', customer: 'Trần Thị B', date: '2025-03-19', total: 230000, status: 'Đang xử lý' },
    { id: 'DH00126', customer: 'Lê Văn C', date: '2025-03-18', total: 510000, status: 'Đã giao' },
];

const DashboardPage = () => {
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Title level={2} className="text-center mb-6">
                📊 Bảng điều khiển
            </Title>

            <Row gutter={[16, 16]}>
                {stats.map((item, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card bordered={false} className="shadow-lg rounded-xl">
                            <Statistic
                                title={item.title}
                                value={item.value}
                                prefix={item.icon}
                                valueStyle={{ color: item.color, fontWeight: 600 }}
                                suffix={item.isCurrency ? 'VND' : ''}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card title="📝 Đơn hàng gần đây" className="mt-8 shadow-xl rounded-xl" style={{ marginTop: '20px' }}>
                <Table columns={columns} dataSource={recentOrders} rowKey="id" pagination={false} />
            </Card>
        </div>
    );
};

export default DashboardPage;
