import React, { useEffect, useState } from 'react';
import { Card, Form, Select, Button, Table, Spin, message } from 'antd';
import {
    getBatchWidthQueryApi,
    getDepartmentByIdApi,
    getHandOverApi,
    getMaterialRequestsApi,
    getStorageApi,
    getStorageByIdApi,
} from '@/services/api';
import { useCurrentApp } from '@/components/context/app.context';

interface IMaterialStat {
    materialId: string;
    materialName: string;
    importQuantity: number;
    exportQuantity: number;
}
interface IResult {
    materialId: string;
    materialName: string;
    importQuantity: number;
    exportQuantity: number;
    remainingQuantity: number;
}
const StatisticsByStorage: React.FC = () => {
    const [form] = Form.useForm();
    const [storages, setStorages] = useState<IStorage[]>([]);
    const [batches, setBatches] = useState<IBatch[]>([]);
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [statistics, setStatistics] = useState<IMaterialStat[]>([]);
    const [dataTable, setDataTable] = useState<IResult[]>([]);
    const { user } = useCurrentApp();
    const [userStorage, setUserStorage] = useState<IStorage>();
    useEffect(() => {
        const fetchData = async () => {
            const fetchDepart = await getDepartmentByIdApi(user?.departIdentity ?? '');
            if (fetchDepart && fetchDepart.data) {
                const res = await getStorageByIdApi(fetchDepart.data.storageId);
                if (res && res.data) {
                    setUserStorage(res.data);
                }
            }
        };
        fetchData();
    }, [user]);
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [storagesRes, batchesRes] = await Promise.all([
                getStorageApi('&mainStorage=false'),
                getBatchWidthQueryApi(''),
            ]);
            setStorages(storagesRes.data ?? []);
            setBatches(batchesRes.data ?? []);
        } catch (err) {
            message.error('Lỗi khi tải danh sách kho và đợt cấp' + err);
        }
    };

    const handleFilter = async (values: { storageId: string; batchId: string }) => {
        setLoading(true);
        try {
            const [handOverRes, requestRes] = await Promise.all([getHandOverApi(''), getMaterialRequestsApi('')]);

            const exports = handOverRes.data as IHandOver[];
            const imports = requestRes.data as IMaterialRequest[];

            const batch = batches.find((b) => b.id === values.batchId);
            if (!batch) {
                message.warning('Không tìm thấy đợt cấp tương ứng');
                return;
            }

            const filteredExports = exports.filter(
                (item) => item.storage === values.storageId && item.batch === batch.name,
            );

            const filteredImports = imports.filter(
                (item) => item.requesterInfo.departmentId === values.storageId && item.batch === batch.name,
            );

            const data = calculateStatistics(filteredExports, filteredImports);
            const result: IResult[] = data.map((item) => {
                return {
                    exportQuantity: item.exportQuantity,
                    importQuantity: item.importQuantity,
                    materialId: item.materialId,
                    materialName: item.materialName,
                    remainingQuantity:
                        storages
                            .find((e) => e.id === values.storageId)
                            ?.materials.find((e) => e.supplyId === item.materialId)?.quantity ?? 0,
                };
            });
            setStatistics(data);
            setDataTable(result);
        } catch (err) {
            message.error('Lỗi khi lọc dữ liệu thống kê' + err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (exports: IHandOver[], imports: IMaterialRequest[]): IMaterialStat[] => {
        const resultMap = new Map<string, IMaterialStat>();

        // Nhập
        for (const request of imports) {
            for (const m of request.materialRequests) {
                const existing = resultMap.get(m.materialId) || {
                    materialId: m.materialId,
                    materialName: m.materialName,
                    importQuantity: 0,
                    exportQuantity: 0,
                };
                existing.importQuantity += m.deliveredQuantity || 0;
                resultMap.set(m.materialId, existing);
            }
        }

        // Xuất
        for (const exp of exports) {
            for (const m of exp.materials) {
                const existing = resultMap.get(m.supplyId) || {
                    materialId: m.supplyId,
                    materialName: m.materialName,
                    importQuantity: 0,
                    exportQuantity: 0,
                };
                existing.exportQuantity += m.quantity;
                resultMap.set(m.supplyId, existing);
            }
        }

        return Array.from(resultMap.values());
    };

    return (
        <Card title="Thống kê nhập - xuất theo kho và đợt cấp">
            <Form form={form} layout="inline" onFinish={handleFilter}>
                {user?.role === 'manager' ? (
                    <Form.Item name="storageId" label="Chọn kho" rules={[{ required: true }]}>
                        <Select style={{ width: 200 }} placeholder="Chọn kho">
                            {userStorage && (
                                <Select.Option key={userStorage.id} value={userStorage.id}>
                                    {userStorage.name}
                                </Select.Option>
                            )}
                        </Select>
                    </Form.Item>
                ) : (
                    <Form.Item name="storageId" label="Chọn kho" rules={[{ required: true }]}>
                        <Select style={{ width: 200 }} placeholder="Chọn kho">
                            {storages.map((storage) => (
                                <Select.Option key={storage.id} value={storage.id}>
                                    {storage.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item name="batchId" label="Chọn đợt cấp" rules={[{ required: true }]}>
                    <Select style={{ width: 250 }} placeholder="Chọn đợt cấp">
                        {batches.map((batch) => (
                            <Select.Option key={batch.id} value={batch.id}>
                                {batch.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Thống kê
                    </Button>
                </Form.Item>
            </Form>

            <Spin spinning={loading}>
                <Table
                    style={{ marginTop: 24 }}
                    dataSource={dataTable}
                    rowKey="materialId"
                    columns={[
                        {
                            title: 'Tên vật tư',
                            dataIndex: 'materialName',
                        },
                        {
                            title: 'Số lượng nhập',
                            dataIndex: 'importQuantity',
                            align: 'center',
                        },
                        {
                            title: 'Số lượng xuất',
                            dataIndex: 'exportQuantity',
                            align: 'center',
                        },
                        {
                            title: 'Số lượng tồn kho',
                            dataIndex: 'remainingQuantity',
                            align: 'center',
                        },
                    ]}
                    pagination={false}
                />
            </Spin>
        </Card>
    );
};

export default StatisticsByStorage;
