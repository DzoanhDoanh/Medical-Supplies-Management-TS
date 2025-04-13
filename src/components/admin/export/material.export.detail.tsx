/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Form, Button, Select, Table, InputNumber, Card, Typography, Spin, message, Descriptions } from 'antd';
import {
    getBatchWidthQueryApi,
    getMainStorageApi,
    getMaterialRequestsApi,
    getStorageApi,
    getStorageByIdApi,
    getUsersApi,
    transferToAnotherStorageApi,
    updateMaterialRequestApi,
    updateQuantityOfMainStorageApi,
} from '@/services/api';
import dayjs from 'dayjs';
import { FORMAT_DATE_VN } from '@/services/helper';

const { Title } = Typography;

interface MaterialRequest {
    materialId: string;
    materialName: string;
    quantity: number;
    deliveredQuantity?: number;
}
type MaterialRequestMerge = {
    materialId: string;
    materialName: string;
    quantity: number;
};
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
    const [allMaterials, setAllMaterials] = useState<MaterialStorage[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [storages, setStorages] = useState<IStorage[]>([]);
    const [senderInfo, setSenderInfo] = useState<SenderInfo>({ userId: '', userName: '' });
    const [batchValue, setBatchValue] = useState<string>('');
    const [batches, setBatches] = useState<IBatch[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            const res = await getMaterialRequestsApi('status_like=1');
            const res2 = await getMainStorageApi();
            const fetchUser = await getUsersApi('');
            const fetchStorage = await getStorageApi('');
            const fetchBatch = await getBatchWidthQueryApi('');
            if (res && res.data) {
                setMaterialRequests(res.data);
            }
            if (res2 && res2.data) {
                setAllMaterials(res2.data.materials);
            }
            if (fetchUser && fetchUser.data) {
                setUsers(fetchUser.data);
            }
            if (fetchStorage && fetchStorage.data) {
                setStorages(fetchStorage.data);
            }
            if (fetchBatch && fetchBatch.data) {
                setBatches(fetchBatch.data);
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
    const mergeMaterialRequests = (base: MaterialRequestMerge[], addition: MaterialRequestMerge[]) => {
        const map = new Map<string, MaterialRequestMerge>();

        // Bắt đầu với danh sách ban đầu
        base.forEach((item) => {
            map.set(item.materialId, { ...item });
        });

        // Gộp từ danh sách bổ sung
        addition.forEach((item) => {
            if (map.has(item.materialId)) {
                map.get(item.materialId)!.quantity += item.quantity;
            } else {
                map.set(item.materialId, { ...item });
            }
        });

        return Array.from(map.values());
    };
    const subtractMaterialRequests = (base: MaterialRequestMerge[], toSubtract: MaterialRequestMerge[]) => {
        const map = new Map<string, MaterialRequestMerge>();

        // Bắt đầu với danh sách gốc
        base.forEach((item) => {
            map.set(item.materialId, { ...item });
        });

        // Trừ đi từ danh sách toSubtract
        toSubtract.forEach((item) => {
            if (map.has(item.materialId)) {
                const existing = map.get(item.materialId)!;
                existing.quantity = Math.max(0, existing.quantity - item.quantity); // Không để âm
            }
        });

        return Array.from(map.values());
    };
    const handleChangeReceiver = (values: string) => {
        const user = users.find((e) => e.id === values);
        setSenderInfo({ userId: user?.id ?? '', userName: user?.fullName ?? '' });
    };
    const handleChangeBatch = (values: string) => {
        setBatchValue(values);
    };
    const handleSubmit = async () => {
        if (senderInfo.userId === '') {
            message.error('Hãy chọn người nhận');
            return;
        }
        if (batchValue === '') {
            message.error('Hãy chọn đợt cấp');
            return;
        }
        try {
            setLoading(true);
            const baseData = await getStorageByIdApi(selectedRequest?.requesterInfo.departmentId ?? '');
            const mainStorage = await getMainStorageApi();
            const addition = tableData.map((item) => {
                return {
                    materialId: item.materialId,
                    materialName: item.materialName,
                    quantity: item.deliveredQuantity ?? 0,
                };
            });
            const base = baseData.data?.materials.map((item) => {
                return {
                    materialId: item.supplyId,
                    materialName: item.materialName,
                    quantity: item.quantity ?? 0,
                };
            });
            const subBase = mainStorage.data?.materials.map((item) => {
                return {
                    materialId: item.supplyId,
                    materialName: item.materialName,
                    quantity: item.quantity ?? 0,
                };
            });
            const sub = tableData.map((item) => {
                return {
                    materialId: item.materialId,
                    materialName: item.materialName,
                    quantity: item.deliveredQuantity ?? 0,
                };
            });
            const materialsTransfer = mergeMaterialRequests(base ?? [], addition ?? []).map((item) => {
                return {
                    supplyId: item.materialId,
                    materialName: item.materialName,
                    quantity: item.quantity,
                };
            });
            const materialOfMainStorage = subtractMaterialRequests(subBase ?? [], sub).map((item) => {
                return {
                    supplyId: item.materialId,
                    materialName: item.materialName,
                    quantity: item.quantity,
                };
            });

            const updateMainStorage = await updateQuantityOfMainStorageApi(
                materialOfMainStorage as unknown as MaterialStorage,
            );
            const updateDestinationStorage = await transferToAnotherStorageApi(
                selectedRequest?.requesterInfo.departmentId ?? '',
                materialsTransfer as unknown as MaterialStorage,
            );
            // const updateStatus = await updateStatusMaterialRequestApi(selectedRequest?.id ?? '', 3);
            const updateStatus = await updateMaterialRequestApi(
                selectedRequest?.id ?? '',
                senderInfo,
                3,
                tableData,
                batchValue,
            );
            if (
                updateMainStorage &&
                updateMainStorage.data &&
                updateDestinationStorage &&
                updateDestinationStorage.data &&
                updateStatus &&
                updateStatus.data
            ) {
                setSelectedRequest(null);
                setTableData([]);
                form.resetFields();
                setLoading(false);
                message.success('Bàn giao vật tư thành công');
            }
            setLoading(false);
        } catch (error) {
            message.error('Có lỗi khi bàn giao vật tư vui lòng thử lại');
            console.log(error);
            setLoading(false);
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
                const result = allMaterials.find((e) => e.supplyId === record.materialId);
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
                            <Form.Item name={'receiverInfo'} label="Chọn người gửi">
                                <Select
                                    placeholder="Chọn người gửi"
                                    style={{ width: '100%' }}
                                    onChange={handleChangeReceiver}
                                >
                                    {users.map((item) => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.fullName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name={'batch'} label="Chọn đợt cấp">
                                <Select
                                    placeholder="Chọn đợt cấp"
                                    style={{ width: '100%' }}
                                    onChange={handleChangeBatch}
                                >
                                    {batches.map((item) => (
                                        <Select.Option key={item.id} value={item.name}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Form>
                        {selectedRequest && (
                            <Descriptions title="Chi tiết phiếu yêu cầu" bordered column={2}>
                                <Descriptions.Item label="Tên người nhận vật tư">
                                    {users.find((e) => e.id === selectedRequest?.requesterInfo.requesterName)?.fullName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên đơn yêu cầu">
                                    {selectedRequest?.requestName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kho nhận">
                                    {storages.find((e) => e.id === selectedRequest?.requesterInfo.departmentId)?.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">
                                    {' '}
                                    {dayjs(selectedRequest?.createAt).format(FORMAT_DATE_VN)}
                                </Descriptions.Item>
                            </Descriptions>
                        )}
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
