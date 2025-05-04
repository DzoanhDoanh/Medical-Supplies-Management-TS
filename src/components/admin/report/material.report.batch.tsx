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
            const [importRes, exportRes, materialRes, mainStorage] = await Promise.all([
                getImportRequestsApi('&status_like=3'),
                getMaterialRequestsApi('&status_like=3'),
                getSuppliesApi(''),
                getMainStorageApi(),
            ]);

            const importRequests: IImportRequest[] = importRes.data || [];
            const exportRequests: IMaterialRequest[] = exportRes.data || [];
            const materials: ISupplies[] = materialRes.data || [];
            const quantityDetail = mainStorage.data?.materials;

            const batch = batches.find((b) => b.id === batchId);
            if (!batch) {
                message.error('Không tìm thấy thông tin đợt.');
                setLoading(false);
                return;
            }

            const batchStartDate = dayjs(batch.createAt);

            // Tính tồn đầu kỳ
            const openingStockMap = new Map<string, { name: string; quantity: number }>();

            // Tính tổng nhập trước đợt
            importRequests
                .filter((req) => dayjs(req.createAt).isBefore(batchStartDate))
                .forEach((req) => {
                    req.materialRequests.forEach((item) => {
                        const current = openingStockMap.get(item.materialId) || {
                            name: item.materialName,
                            quantity: 0,
                        };
                        openingStockMap.set(item.materialId, {
                            name: item.materialName,
                            quantity: current.quantity + (item.deliveredQuantity ?? item.quantity),
                        });
                    });
                });

            // Trừ tổng xuất trước đợt
            exportRequests
                .filter((req) => dayjs(req.createAt).isBefore(batchStartDate))
                .forEach((req) => {
                    req.materialRequests.forEach((item) => {
                        const current = openingStockMap.get(item.materialId) || {
                            name: item.materialName,
                            quantity: 0,
                        };
                        openingStockMap.set(item.materialId, {
                            name: item.materialName,
                            quantity: current.quantity - (item.deliveredQuantity ?? item.quantity),
                        });
                    });
                });

            // Tính nhập trong kỳ
            const importInBatchMap = new Map<string, number>();
            importRequests
                .filter((req) => req.receiverInfo?.userId === batchId)
                .forEach((req) => {
                    req.materialRequests.forEach((item) => {
                        const current = importInBatchMap.get(item.materialId) || 0;
                        importInBatchMap.set(item.materialId, current + (item.deliveredQuantity ?? item.quantity));
                    });
                });

            // Tính xuất trong kỳ
            const exportInBatchMap = new Map<string, number>();
            exportRequests
                .filter((req) => req.batch === batchName)
                .forEach((req) => {
                    req.materialRequests.forEach((item) => {
                        const current = exportInBatchMap.get(item.materialId) || 0;
                        exportInBatchMap.set(item.materialId, current + (item.deliveredQuantity ?? item.quantity));
                    });
                });

            // Gom dữ liệu để render
            const materialIds = new Set([
                ...openingStockMap.keys(),
                ...importInBatchMap.keys(),
                ...exportInBatchMap.keys(),
            ]);

            const finalData: MaterialData[] = Array.from(materialIds).map((id) => {
                const name = materials.find((e) => e.id === id)?.name || '';
                const importQty = importInBatchMap.get(id) || 0;
                const exportQty = exportInBatchMap.get(id) || 0;
                const closing = quantityDetail?.find((e) => e.supplyId === id)?.quantity || 0;
                const opening = closing - importQty + exportQty;
                return {
                    key: id,
                    name,
                    batch: selectedBatchName,
                    openingStock: opening,
                    importQuantity: importQty,
                    exportQuantity: exportQty,
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
                {data.length === 0 ? (
                    <></>
                ) : (
                    <CSVLink data={data} filename="report.csv" style={{ marginLeft: '12px' }}>
                        <Button icon={<ExportOutlined />} type="primary">
                            Tải excel
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
