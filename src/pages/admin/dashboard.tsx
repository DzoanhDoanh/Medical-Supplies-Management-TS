/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Spin, Statistic, Tabs, message } from 'antd';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
} from 'recharts';
import { getCategoryApi, getImportRequestsApi, getMaterialRequestsApi, getSuppliesApi } from '@/services/api';
import { FileTextOutlined, ShoppingCartOutlined, RiseOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
    const [importRequests, setImportRequests] = useState<any[]>([]);
    const [materialRequests, setMaterialRequests] = useState<any[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [supplies, setSupplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const importData = await getImportRequestsApi('');
                const materialData = await getMaterialRequestsApi('');
                const supplyData = await getSuppliesApi('');
                const categoryData = await getCategoryApi();
                setCategories(categoryData.data || []);
                setImportRequests(importData.data || []);
                setMaterialRequests(materialData.data || []);
                setSupplies(supplyData.data || []);
            } catch (error) {
                message.error('Lỗi khi tải dữ liệu');
            }
            setLoading(false);
        };

        fetchData();
    }, []);
    if (loading) {
        return <Spin fullscreen />;
    }
    const stats = [
        { title: 'Số lượng phiếu nhập', value: importRequests.length, icon: <ShoppingCartOutlined /> },
        { title: 'Số lượng phiếu xuất', value: materialRequests.length, icon: <FileTextOutlined /> },
        { title: 'Tổng số vật tư', value: supplies.length, icon: <RiseOutlined /> },
    ];
    const pieDataRaw = Object.values(
        supplies.reduce<Record<string, { name: string; value: number }>>((acc, supply) => {
            const { categoryId, quantity } = supply;

            if (!acc[categoryId]) {
                acc[categoryId] = { name: categoryId, value: 0 };
            }

            acc[categoryId].value += quantity;

            return acc;
        }, {}),
    );
    const pieData = pieDataRaw.map((item) => {
        const categoryValue = (categories ?? []).find((e) => e.id === item.name);
        return {
            name: categoryValue?.categoryName ?? '',
            value: item.value,
        };
    });
    const COLORS = [
        '#FF4D4F',
        '#1890FF',
        '#52C41A',
        '#FAAD14',
        '#722ED1',
        '#FA8C16',
        '#A52A2A',
        '#000000',
        '#FFFFFF',
        '#EB2F96',
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: '10px' }}>Bảng điều khiển</h2>
            <Row gutter={16}>
                {stats.map((stat, index) => (
                    <Col span={8} key={stat.title}>
                        <Card style={{ backgroundColor: `${COLORS[index]}` }}>
                            <Statistic
                                title={<span style={{ color: '#fff' }}>{stat.title}</span>}
                                value={stat.value}
                                prefix={<span style={{ color: '#fff' }}>{stat.icon}</span>}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
                <Tabs.TabPane tab="Biểu đồ tổng quan" key="1">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={supplies} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="quantity" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Biểu đồ cột thống kê số lượng" key="2">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={supplies} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quantity" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Phân loại vật tư" key="3">
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                fill="red"
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};

export default Dashboard;
