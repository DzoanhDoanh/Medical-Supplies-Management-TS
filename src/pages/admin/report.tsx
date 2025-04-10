import React, { useState } from 'react';
import { Button, Table, Card, message, Tabs, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { getStorageApi, getMaterialRequestsApi, getImportRequestsApi } from '@/services/api';
import isBetween from 'dayjs/plugin/isBetween';
import StorageReport from '@/components/admin/report/material.report.storage';
dayjs.extend(isBetween);
interface MaterialData {
    key: string;
    name: string;
    importQuantity: number;
    exportQuantity: number;
    remaining: number;
    importDate?: string;
    exportDate?: string;
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
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');

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

            const fetchedData: MaterialData[] = mainStorage.materials.map((material) => {
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

                return {
                    key: material.supplyId,
                    name: material.materialName,
                    importQuantity: totalImported,
                    exportQuantity: totalExported,
                    remaining: material.quantity,
                    importDate: lastImportDate ? dayjs(lastImportDate).format('DD-MM-YYYY') : 'Trống',
                    exportDate: lastExportDate ? dayjs(lastExportDate).format('DD-MM-YYYY') : 'Trống',
                };
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

        const filtered = data.filter(
            (item) =>
                (item.importDate && dayjs(item.importDate, 'DD-MM-YYYY').isBetween(fromDate, toDate, null, '[]')) ||
                (item.exportDate && dayjs(item.exportDate, 'DD-MM-YYYY').isBetween(fromDate, toDate, null, '[]')),
        );
        setFilteredData(filtered);
    };

    const columns: ColumnsType<MaterialData> = [
        { title: 'Tên vật tư', dataIndex: 'name', key: 'name' },
        { title: 'Số lượng nhập', dataIndex: 'importQuantity', key: 'importQuantity' },
        { title: 'Số lượng xuất', dataIndex: 'exportQuantity', key: 'exportQuantity' },
        { title: 'Vật tư còn lại', dataIndex: 'remaining', key: 'remaining' },
        { title: 'Ngày nhập cuối', dataIndex: 'importDate', key: 'importDate' },
        { title: 'Ngày xuất cuối', dataIndex: 'exportDate', key: 'exportDate' },
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
                    <Tabs.TabPane tab="Báo cáo tổng thể" key="1">
                        <Table
                            columns={columns}
                            dataSource={data}
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            bordered
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Báo cáo theo ngày" key="2">
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <DatePicker
                                placeholder="Từ ngày"
                                onChange={(date) => setFromDate(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                            />
                            <DatePicker
                                placeholder="Đến ngày"
                                onChange={(date) => setToDate(date ? dayjs(date).format('YYYY-MM-DD') : '')}
                            />
                            <Button type="primary" onClick={handleFilterByDate}>
                                Lọc dữ liệu
                            </Button>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            bordered
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Báo cáo số lượng trong kho" key="5">
                        <StorageReport />
                    </Tabs.TabPane>
                </Tabs>
            )}
        </div>
    );
};

export default MaterialStatisticsReport;
