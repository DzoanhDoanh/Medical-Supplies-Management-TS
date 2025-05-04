/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, message } from 'antd';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    ResponsiveContainer,
} from 'recharts';
import { getStorageApi, getImportRequestsApi, getMaterialRequestsApi } from '@/services/api';

interface MaterialStorage {
    supplyId: string;
    materialName: string;
    quantity: number;
}

interface IStorage {
    id: string;
    name: string;
    materials: MaterialStorage[];
    mainStorage: boolean; // Dùng để xác định kho tổng
}

interface MaterialRequests {
    materialId: string;
    materialName: string;
    quantity: number;
    deliveredQuantity?: number;
}

interface IMaterialRequest {
    materialRequests: MaterialRequests[];
    createAt: string;
}

interface IImportRequest {
    materialRequests: MaterialRequests[];
    createAt: string;
}

const Dashboard: React.FC = () => {
    const [storages, setStorages] = useState<IStorage[]>([]);
    const [importRequests, setImportRequests] = useState<IImportRequest[]>([]);
    const [materialRequests, setMaterialRequests] = useState<IMaterialRequest[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [storageRes, importRes, requestRes] = await Promise.all([
                    getStorageApi(''),
                    getImportRequestsApi(''),
                    getMaterialRequestsApi(''),
                ]);
                if (storageRes?.data) setStorages(storageRes.data);
                if (importRes?.data) setImportRequests(importRes.data);
                if (requestRes?.data) setMaterialRequests(requestRes.data);
            } catch (error) {
                message.error('Lỗi khi lấy dữ liệu.');
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Lấy dữ liệu từ kho tổng
    const mainStorage = storages.find((storage) => storage.mainStorage);
    const materialsInMainStorage = mainStorage ? mainStorage.materials : [];

    // Thống kê tổng vật tư trong kho tổng
    const totalMaterials = materialsInMainStorage.reduce((sum, material) => sum + material.quantity, 0);

    // Dữ liệu biểu đồ cột
    const barChartData = materialsInMainStorage.map((material) => ({
        name: material.materialName,
        quantity: material.quantity,
    }));

    // Chuẩn hóa dữ liệu nhập
    const lineChartData = importRequests.map((req) => ({
        date: req.createAt,
        import: req.materialRequests.reduce((sum, material) => sum + material.quantity, 0),
    }));

    // Chuẩn hóa dữ liệu xuất
    const exportChartData = materialRequests.map((req) => ({
        date: req.createAt,
        export: req.materialRequests.reduce((sum, material) => sum + (material.deliveredQuantity || 0), 0),
    }));

    // Gộp dữ liệu nhập - xuất
    const combinedLineChartData: { date: string; import: number; export: number }[] = [];
    lineChartData.forEach((item) => {
        combinedLineChartData.push({ date: item.date, import: item.import, export: 0 });
    });

    exportChartData.forEach((item) => {
        const existing = combinedLineChartData.find((data) => data.date === item.date);
        if (existing) {
            existing.export = item.export;
        } else {
            combinedLineChartData.push({ date: item.date, import: 0, export: item.export });
        }
    });

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={[16, 16]}>
                {/* Thống kê tổng quan */}
                <Col span={8}>
                    <Card>
                        <Statistic title="Tổng số vật tư" value={totalMaterials} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Tổng số kho" value={storages.length} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Tổng số phiếu nhập" value={importRequests.length} />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ cột */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Biểu đồ cột - Số lượng vật tư trong kho tổng">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#8884d8" name="Số lượng" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            {/* Biểu đồ đường */}
            {/* <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Biểu đồ nhập - xuất vật tư theo thời gian">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={combinedLineChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="import" stroke="#82ca9d" name="Nhập" />
                                <Line type="monotone" dataKey="export" stroke="#8884d8" name="Xuất" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row> */}
        </div>
    );
};

export default Dashboard;
