/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Form, Button, Select, Table, message, InputNumber, Card, Typography, Spin } from 'antd';
import {
    getMaterialRequestsApi,
    getSuppliesApi,
    updateMaterialRequestApi,
    updateQuantitySupplyApi,
} from '@/services/api';

const { Title } = Typography;

interface MaterialRequest {
    materialId: string;
    materialName: string;
    quantity: number;
    deliveredQuantity?: number;
}

interface Request {
    id: string;
    requestName: string;
    requesterInfo: {
        requesterName: string;
        departmentId: string;
        type: string;
    };
    materialRequests: MaterialRequest[];
    status: number;
    createAt: string;
    updateAt: string;
}
const MaterialTransfer = () => {
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [tableData, setTableData] = useState<MaterialRequest[]>([]);
    const [materialRequests, setMaterialRequests] = useState<IMaterialRequest[]>([]);
    const [allMaterials, setAllMaterials] = useState<ISupplies[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            const res = await getMaterialRequestsApi('status_like=1');
            const res2 = await getSuppliesApi('');
            if (res && res.data) {
                setMaterialRequests(res.data);
            }
            if (res2 && res2.data) {
                setAllMaterials(res2.data);
            }
        };
        fetchData();
    }, [tableData]);
    const handleRequestChange = (value: string) => {
        const request = materialRequests.find((req) => req.id === value) as Request;
        if (request) {
            setSelectedRequest(request);
            setTableData(
                request.materialRequests.map((item) => ({
                    ...item,
                    deliveredQuantity: 0,
                })),
            );
        }
    };

    const handleQuantityChange = (value: number, materialId: string) => {
        setTableData((prev) =>
            prev.map((item) => {
                if (item.materialId === materialId) {
                    return { ...item, deliveredQuantity: value };
                }
                return item;
            }),
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            for (const item of tableData) {
                const material = allMaterials.find((e) => e.id === item.materialId);

                if (material) {
                    if (material.quantity < (item.deliveredQuantity ?? 0)) {
                        message.error('Số lượng bàn giao không được nhiều hơn số lượng trong kho');
                        setLoading(false);
                        return;
                    }
                }
            }
            for (const item of tableData) {
                const material = allMaterials.find((e) => e.id === item.materialId);

                if (material) {
                    if (material.quantity < (item.deliveredQuantity ?? 0)) {
                        message.error('Số lượng bàn giao không được nhiều hơn số lượng trong kho');
                        setLoading(false);
                        return;
                    }
                    const quantity = material.quantity - (item.deliveredQuantity ?? 0);
                    await updateQuantitySupplyApi(item.materialId, quantity);
                }
            }
            const res = await updateMaterialRequestApi(selectedRequest?.id ?? '', 3, tableData ?? []);
            if (res && res.data) {
                message.success('Bàn giao vật tư thành công!');
                setSelectedRequest(null);
                setTableData([]);
                form.resetFields();
                setLoading(false);
            } else {
                message.success('Bàn giao vật tư thất bại!');
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            message.success('Bàn giao vật tư thất bại!');
        }
    };

    const columns = [
        {
            title: 'Tên vật tư',
            dataIndex: 'materialName',
            key: 'materialName',
        },
        {
            title: 'Số lượng yêu cầu',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Số lượng bàn giao',
            dataIndex: 'deliveredQuantity',
            key: 'deliveredQuantity',
            render: (text: any, record: any) => (
                <InputNumber
                    min={0}
                    max={record.quantity}
                    value={record.deliveredQuantity}
                    onChange={(value) => handleQuantityChange(value, record.materialId)}
                />
            ),
        },
        {
            title: 'Số lượng trong kho',
            key: 'storage',
            render: (text: any, record: any) => {
                const result = allMaterials.find((e) => e.id === record.materialId);
                return <span>{result?.quantity}</span>;
            },
        },
    ];

    return (
        <>
            {loading ? (
                <Spin fullscreen></Spin>
            ) : (
                <div>
                    <Card
                        style={{
                            marginBottom: 24,
                            padding: 20,
                            borderRadius: '10px',
                            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
                            Bàn Giao Vật Tư
                        </Title>
                        <Form form={form} layout="vertical">
                            <Form.Item name={'requestName'} label="Chọn Phiếu Yêu Cầu">
                                <Select
                                    placeholder="Chọn phiếu yêu cầu"
                                    style={{ width: '100%' }}
                                    onChange={handleRequestChange}
                                >
                                    {materialRequests.map((req) => (
                                        <Select.Option key={req.id} value={req.id}>
                                            {req.requestName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Form>
                    </Card>

                    {selectedRequest && (
                        <Card style={{ padding: 20, borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                            <Title level={4}>Thông Tin Vật Tư</Title>
                            <Table
                                columns={columns}
                                dataSource={tableData}
                                rowKey="materialId"
                                pagination={false}
                                style={{ marginBottom: 24 }}
                            />
                            <Button type="primary" onClick={handleSubmit}>
                                Bàn giao vật tư
                            </Button>
                        </Card>
                    )}
                </div>
            )}
        </>
    );
};

export default MaterialTransfer;
