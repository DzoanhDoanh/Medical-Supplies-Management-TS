/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Card, Table, Select, message, Spin, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { CSVLink } from 'react-csv';
import {
    getBatchWidthQueryApi,
    getImportRequestsApi,
    getMainStorageApi,
    getMaterialRequestsApi,
    getSuppliesApi,
} from '@/services/api';
import { ExportOutlined } from '@ant-design/icons';

interface MaterialData {
    key: string;
    name: string;
    batch: string;
    openingStock: number; // Tồn đầu kỳ
    importQuantity: number; // Nhập trong kỳ
    exportQuantity: number; // Xuất trong kỳ
    closingStock: number; // Tồn cuối kỳ
}

const MaterialBatchReport: React.FC = () => {
    const [batches, setBatches] = useState<IBatch[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');
    const [selectedBatchName, setSelectedBatchName] = useState<string>('');
    const [data, setData] = useState<MaterialData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await getBatchWidthQueryApi('');
            setBatches(res.data || []);
        } catch (error) {
            console.error('Error fetching batches:', error);
            message.error('Lỗi khi lấy danh sách đợt.');
        }
    };

    const fetchData = async (batchId: string, batchName: string) => {
        setLoading(true);
        try {
            // 1. Lấy tất cả import, export, materials (danh sách vật tư)
            const [importRes, exportRes, materialRes] = await Promise.all([
                getImportRequestsApi('&status_like=3'),
                getMaterialRequestsApi('&status_like=3'),
                getSuppliesApi(''),
            ]);
            const importRequests: IImportRequest[] = importRes.data || [];
            const exportRequests: IMaterialRequest[] = exportRes.data || [];
            const materials: ISupplies[] = materialRes.data || [];

            // 2. Tìm thông tin batch (để xác định ngày bắt đầu)
            const batch = batches.find((b) => b.id === batchId);
            if (!batch) {
                message.error('Không tìm thấy thông tin đợt.');
                setLoading(false);
                return;
            }
            const batchStartDate = dayjs(batch.startDate);
            const batchEndDate = dayjs(batch.endDate);

            // === Tính TỒN ĐẦU KỲ ===
            // Mục đích: tính tổng nhập trước ngày batchStartDate, rồi trừ tổng xuất trước ngày đó.
            const openingStockMap = new Map<string, { name: string; quantity: number }>();

            // --- Tổng NHẬP trước đợt ---
            importRequests
                .filter((req) => dayjs(req.createAt).isBefore(batchStartDate))
                .forEach((req) => {
                    req.materialRequests.forEach((item) => {
                        const prev = openingStockMap.get(item.materialId) || {
                            name: item.materialName,
                            quantity: 0,
                        };
                        openingStockMap.set(item.materialId, {
                            name: item.materialName,
                            quantity: prev.quantity + (item.deliveredQuantity ?? item.quantity),
                        });
                    });
                });

            // --- Trừ tổng XUẤT trước đợt ---
            exportRequests
                .filter((req) => dayjs(req.createAt).isBefore(batchStartDate))
                .forEach((req) => {
                    req.materialRequests.forEach((item) => {
                        const prev = openingStockMap.get(item.materialId) || {
                            name: item.materialName,
                            quantity: 0,
                        };
                        openingStockMap.set(item.materialId, {
                            name: item.materialName,
                            quantity: prev.quantity - (item.deliveredQuantity ?? item.quantity),
                        });
                    });
                });

            // === Tính NHẬP TRONG KỲ ===
            // Lọc các importRequests “thuộc batch” (theo nghiệp vụ hiện tại: receiverInfo.userId === batchId)
            const importInBatchMap = new Map<string, number>();
            importRequests
                .filter((req) => req.receiverInfo?.userId === batchId)
                .forEach((req) => {
                    req.materialRequests.forEach((item) => {
                        const curr = importInBatchMap.get(item.materialId) || 0;
                        importInBatchMap.set(item.materialId, curr + (item.deliveredQuantity ?? item.quantity));
                    });
                });

            // === Tính XUẤT TRONG KỲ ===
            // Lọc các exportRequests “thuộc batch” (theo nghiệp vụ hiện tại: req.batch === batchName)
            const exportInBatchMap = new Map<string, number>();
            exportRequests
                .filter((req) => req.batch === batchName)
                .forEach((req) => {
                    req.materialRequests.forEach((item) => {
                        const curr = exportInBatchMap.get(item.materialId) || 0;
                        exportInBatchMap.set(item.materialId, curr + (item.deliveredQuantity ?? item.quantity));
                    });
                });

            // === Gom tất cả materialId xuất hiện ở một trong ba phép tính ===
            const allMaterialIds = new Set<string>([
                ...openingStockMap.keys(),
                ...importInBatchMap.keys(),
                ...exportInBatchMap.keys(),
            ]);

            // === Tạo mảng cuối cùng ===
            const finalData: MaterialData[] = Array.from(allMaterialIds).map((id) => {
                const name = materials.find((e) => e.id === id)?.name || openingStockMap.get(id)?.name || '';
                const opening = openingStockMap.get(id)?.quantity || 0;
                const imported = importInBatchMap.get(id) || 0;
                const exported = exportInBatchMap.get(id) || 0;
                const closing = opening + imported - exported;

                return {
                    key: id,
                    name,
                    batch: batchName,
                    openingStock: opening,
                    importQuantity: imported,
                    exportQuantity: exported,
                    closingStock: closing,
                };
            });

            setData(finalData);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Lỗi khi lấy dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<MaterialData> = [
        { title: 'Tên vật tư', dataIndex: 'name', key: 'name' },
        { title: 'Tồn đầu kỳ', dataIndex: 'openingStock', key: 'openingStock' },
        { title: 'Nhập trong kỳ', dataIndex: 'importQuantity', key: 'importQuantity' },
        { title: 'Xuất trong kỳ', dataIndex: 'exportQuantity', key: 'exportQuantity' },
        { title: 'Tồn cuối kỳ', dataIndex: 'closingStock', key: 'closingStock' },
    ];

    return (
        <Card title="Báo cáo theo đợt" style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Chọn đợt"
                    style={{ width: 300 }}
                    onChange={(batchId) => {
                        const batch = batches.find((b) => b.id === batchId);
                        if (batch) {
                            setSelectedBatchId(batch.id);
                            setSelectedBatchName(batch.name);
                            fetchData(batch.id, batch.name);
                        }
                    }}
                    options={batches.map((batch) => ({
                        label: batch.name,
                        value: batch.id,
                    }))}
                />
                {data.length > 0 && (
                    <CSVLink data={data} filename="report.csv" style={{ marginLeft: 12 }}>
                        <Button icon={<ExportOutlined />} type="primary">
                            Tải Excel
                        </Button>
                    </CSVLink>
                )}
            </div>

            <Spin spinning={loading}>
                <Table columns={columns} dataSource={data} bordered pagination={{ pageSize: 10 }} />
            </Spin>
        </Card>
    );
};

export default MaterialBatchReport;
