import React, { useState } from 'react';
import { Button, Table, Card, message, Tabs, DatePicker, Tag } from 'antd';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { getStorageApi, getMaterialRequestsApi, getImportRequestsApi } from '@/services/api';
import isBetween from 'dayjs/plugin/isBetween';
import StorageReport from '@/components/admin/report/material.report.storage';
import MaterialBatchReport from '@/components/admin/report/material.report.batch';
import { CSVLink } from 'react-csv';
import { ExportOutlined } from '@ant-design/icons';
dayjs.extend(isBetween);

interface MaterialData {
    key: string;
    name: string;
    quantity: number;
    date: string;
    type: 'import' | 'export';
}

interface MaterialStorage {
    supplyId: string;
    materialName: string;
    quantity: number;
}

interface IStorage {
    id: string;
    name: string;
    materials: MaterialStorage[];
    mainStorage: boolean;
}

interface MaterialRequests {
    materialId: string;
    quantity: number;
    deliveredQuantity?: number;
}

interface IMaterialRequest {
    materialRequests: MaterialRequests[];
    updateAt: string;
}

interface IImportRequest {
    materialRequests: MaterialRequests[];
    createAt: string;
}

const MaterialStatisticsReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MaterialData[]>([]);
    const [filteredData, setFilteredData] = useState<MaterialData[]>([]);
    const [isDisplay, setIsDisplay] = useState(false);
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);

    const handleReport = async () => {
        setLoading(true);
        try {
            const [storageResponse, exportResponse, importResponse] = await Promise.all([
                getStorageApi(''),
                getMaterialRequestsApi(''),
                getImportRequestsApi(''),
            ]);

            const storages: IStorage[] = storageResponse.data ?? [];
            const exportRequests: IMaterialRequest[] = exportResponse.data ?? [];
            const importRequests: IImportRequest[] = importResponse.data ?? [];

            const mainStorage = storages.find((storage) => storage.mainStorage);
            if (!mainStorage) {
                message.error('Không tìm thấy kho tổng.');
                setLoading(false);
                return;
            }

            const fetchedData: MaterialData[] = [];

            mainStorage.materials.forEach((material) => {
                const totalImported = importRequests.reduce((total, request) => {
                    const materialRequest = request.materialRequests.find((m) => m.materialId === material.supplyId);
                    return total + (materialRequest ? materialRequest.quantity : 0);
                }, 0);

                const totalExported = exportRequests.reduce((total, request) => {
                    const materialRequest = request.materialRequests.find((m) => m.materialId === material.supplyId);
                    return total + (materialRequest ? materialRequest.deliveredQuantity || 0 : 0);
                }, 0);

                const lastImportDate = importRequests
                    .filter((request) => request.materialRequests.some((m) => m.materialId === material.supplyId))
                    .map((request) => request.createAt)
                    .sort()
                    .pop();

                const lastExportDate = exportRequests
                    .filter((request) => request.materialRequests.some((m) => m.materialId === material.supplyId))
                    .map((request) => request.updateAt)
                    .sort()
                    .pop();

                if (totalImported > 0 && lastImportDate) {
                    fetchedData.push({
                        key: `${material.supplyId}-import`,
                        name: material.materialName,
                        quantity: totalImported,
                        date: dayjs(lastImportDate).format('DD-MM-YYYY'),
                        type: 'import',
                    });
                }

                if (totalExported > 0 && lastExportDate) {
                    fetchedData.push({
                        key: `${material.supplyId}-export`,
                        name: material.materialName,
                        quantity: totalExported,
                        date: dayjs(lastExportDate).format('DD-MM-YYYY'),
                        type: 'export',
                    });
                }
            });

            setData(fetchedData);
            setIsDisplay(true);
            message.success('Báo cáo thống kê hoàn tất.');
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ API:', error);
            message.error('Đã xảy ra lỗi khi lấy dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterByDate = () => {
        if (!fromDate || !toDate) {
            message.error('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
            return;
        }

        const filtered = data.filter((item) => {
            const itemDate = dayjs(item.date, 'DD-MM-YYYY');
            return itemDate.isBetween(fromDate.startOf('day'), toDate.endOf('day'), null, '[]');
        });

        setFilteredData(filtered);
    };

    const columns: ColumnsType<MaterialData> = [
        { title: 'Tên vật tư', dataIndex: 'name', key: 'name' },
        {
            title: 'Loại giao dịch',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'import' ? 'green' : 'red'}>{type === 'import' ? 'Nhập' : 'Xuất'}</Tag>
            ),
        },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Ngày giao dịch', dataIndex: 'date', key: 'date' },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card style={{ marginBottom: 24 }}>
                <Button type="primary" onClick={handleReport} loading={loading}>
                    Xem báo cáo thống kê
                </Button>
            </Card>

            {isDisplay && (
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Tất cả" key="1">
                        <CSVLink data={data} filename="report.csv">
                            <Button icon={<ExportOutlined />} type="primary">
                                Tải excel
                            </Button>
                        </CSVLink>
                        <Table
                            style={{ marginTop: '12px' }}
                            columns={columns}
                            dataSource={data}
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                            bordered
                            rowKey="key"
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Lọc theo ngày tháng" key="2">
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <DatePicker placeholder="Từ ngày" onChange={(date) => setFromDate(date)} allowClear />
                            <DatePicker placeholder="Đến ngày" onChange={(date) => setToDate(date)} allowClear />
                            <Button type="primary" onClick={handleFilterByDate}>
                                Lọc dữ liệu
                            </Button>
                            {filteredData.length === 0 ? (
                                <></>
                            ) : (
                                <CSVLink data={filteredData} filename="report.csv" style={{ marginLeft: '12px' }}>
                                    <Button icon={<ExportOutlined />} type="primary">
                                        Tải excel
                                    </Button>
                                </CSVLink>
                            )}
                        </div>
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                            bordered
                            rowKey="key"
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Lọc theo kho" key="3">
                        <StorageReport />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Lọc theo đợt" key="4">
                        <MaterialBatchReport />
                    </Tabs.TabPane>
                </Tabs>
            )}
        </div>
    );
};

export default MaterialStatisticsReport;
