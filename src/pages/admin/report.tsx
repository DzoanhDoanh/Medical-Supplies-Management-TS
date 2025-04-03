import React, { useState } from 'react';
import { Button, Table, Card, message, Tabs, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getImportRequestsApi, getMaterialRequestsApi, getSuppliesApi } from '@/services/api';
import { CSVLink } from 'react-csv';
import { ExportOutlined } from '@ant-design/icons';
import MaterialRequestReport from '@/components/admin/report/material.report.period';

interface MaterialData {
    key: string;
    name: string;
    importQuantity: number;
    exportQuantity: number;
    remaining: number;
    importDate?: string;
    exportDate?: string;
}

const MaterialStatisticsReport: React.FC = () => {
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MaterialData[]>([]);
    const [isDisplay, setIsDisplay] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('');

    const handleReport = async () => {
        if (activeTab === '3') {
            if (!fromDate || !toDate) {
                message.error('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
                return;
            }
            setIsDisplay(true);
            return;
        }
        setLoading(true);
        try {
            const [fetchMaterial, fetchRequest, fetchImport] = await Promise.all([
                getSuppliesApi(''),
                getMaterialRequestsApi(''),
                getImportRequestsApi(''),
            ]);

            if (fetchMaterial.data && fetchRequest.data && fetchImport.data) {
                const materials = fetchMaterial.data;
                const materialRequests = fetchRequest.data;
                const importRequests = fetchImport.data;

                const fetchedData: MaterialData[] = materials.map((material) => {
                    const importData = importRequests.find((req) =>
                        req.materialRequests.some((m) => m.materialId === material.id),
                    );
                    const exportData = materialRequests.find((req) =>
                        req.materialRequests.some((m) => m.materialId === material.id),
                    );

                    return {
                        key: material.id,
                        name: material.name,
                        importQuantity: importData
                            ? importData.materialRequests.reduce(
                                  (total, m) => (m.materialId === material.id ? total + m.quantity : total),
                                  0,
                              )
                            : 0,
                        exportQuantity: exportData
                            ? exportData.materialRequests.reduce(
                                  (total, m) =>
                                      m.materialId === material.id ? total + (m.deliveredQuantity || 0) : total,
                                  0,
                              )
                            : 0,
                        remaining: material.quantity,
                        importDate: importData ? importData.createAt : 'Trống',
                        exportDate: exportData ? exportData.updateAt : 'Trống',
                    };
                });
                setIsDisplay(true);
                setData(fetchedData);
                console.log(fetchedData);
                setLoading(false);
                message.success('Báo cáo thống kê hoàn tất.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ API:', error);
            message.error('Đã xảy ra lỗi khi lấy dữ liệu.');
            setLoading(false);
        }
    };
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        setData([]);
        setIsDisplay(false);
    };
    const columns: ColumnsType<MaterialData> = [
        { title: 'Tên vật tư', dataIndex: 'name', key: 'name' },
        { title: 'Số lượng nhập', dataIndex: 'importQuantity', key: 'importQuantity' },
        { title: 'Số lượng xuất', dataIndex: 'exportQuantity', key: 'exportQuantity' },
        { title: 'Vật tư còn lại', dataIndex: 'remaining', key: 'remaining' },
        {
            title: 'Ngày nhập',
            dataIndex: 'importDate',
            key: 'importDate',
            render(dom, entity) {
                if (entity.importDate?.trim() && entity.importDate != 'Trống') {
                    return <>{dayjs(entity.importDate).format('DD-MM-YYYY')}</>;
                }
                return <span>Trống</span>;
            },
        },
        {
            title: 'Ngày xuất',
            dataIndex: 'exportDate',
            key: 'exportDate',
            render(dom, entity) {
                if (entity.exportDate?.trim() && entity.importDate != 'Trống') {
                    return <>{dayjs(entity.importDate).format('DD-MM-YYYY')}</>;
                }
                return <span>Trống</span>;
            },
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    {activeTab === '3' ? (
                        <>
                            <DatePicker
                                placeholder="Từ ngày"
                                onChange={(date) => setFromDate(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                            />
                            <DatePicker
                                placeholder="Đến ngày"
                                onChange={(date) => setToDate(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                            />
                        </>
                    ) : (
                        <></>
                    )}

                    <Button type="primary" onClick={handleReport} loading={loading}>
                        Xem báo cáo thống kê
                    </Button>
                    {isDisplay && (
                        <CSVLink data={data} filename="report-supplies.csv">
                            <Button icon={<ExportOutlined />} type="primary">
                                Tải excel
                            </Button>
                        </CSVLink>
                    )}
                </div>
            </Card>

            <Tabs defaultActiveKey="1" onChange={handleTabChange}>
                <Tabs.TabPane tab="Báo cáo tổng thể" key="1">
                    <Table columns={columns} dataSource={data} loading={loading} pagination={false} bordered />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Biểu đồ" key="2">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="importQuantity" stroke="#82ca9d" name="Nhập" />
                            <Line type="monotone" dataKey="exportQuantity" stroke="#8884d8" name="Xuất" />
                            <Line type="monotone" dataKey="remaining" stroke="#ff7300" name="Tồn" />
                        </LineChart>
                    </ResponsiveContainer>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Báo cáo theo đợt" key="3">
                    {isDisplay && <MaterialRequestReport fromDate={fromDate} toDate={toDate} />}
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};

export default MaterialStatisticsReport;
