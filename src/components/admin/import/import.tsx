/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Form, Button, Select, Table, InputNumber, Card, Typography, Spin, Descriptions, message } from 'antd';
import {
    getImportRequestsApi,
    getMainStorageApi,
    getUsersApi,
    updateImportRequestApi,
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
const Import = () => {
    const [selectedRequest, setSelectedRequest] = useState<IImportRequest | null>(null);
    const [tableData, setTableData] = useState<MaterialRequest[]>([]);
    const [importRequests, setImportRequests] = useState<IImportRequest[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [senderInfo, setSenderInfo] = useState<SenderInfo>({ userId: '', userName: '' });
    const [receiverInfo, setReceiverInfo] = useState<SenderInfo>({ userId: '', userName: '' });
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            const res = await getImportRequestsApi('status_like=1');

            const fetchUser = await getUsersApi('');

            if (res && res.data) {
                setImportRequests(res.data);
            }

            if (fetchUser && fetchUser.data) {
                setUsers(fetchUser.data);
            }
        };
        fetchData();
    }, [tableData]);
    const handleRequestChange = (value: string) => {
        const request = importRequests.find((req) => req.id === value);
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
    const handleChangeReceiver = (values: string) => {
        const user = users.find((e) => e.id === values);
        setReceiverInfo({ userId: user?.id ?? '', userName: user?.fullName ?? '' });
    };
    const handleChangeUserImport = (values: string) => {
        const user = users.find((e) => e.id === values);
        setSenderInfo({ userId: user?.id ?? '', userName: user?.fullName ?? '' });
    };
    const handleSubmit = async () => {
        if (senderInfo.userId === '') {
            message.error('Hãy chọn người nhập vật tư');
            return;
        }
        if (receiverInfo.userId === '') {
            message.error('Hãy chọn người nhận vật tư');
            return;
        }
        try {
            setLoading(true);
            const baseData = await getMainStorageApi();
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

            const materialsTransfer = mergeMaterialRequests(base ?? [], addition ?? []).map((item) => {
                return {
                    supplyId: item.materialId,
                    materialName: item.materialName,
                    quantity: item.quantity,
                };
            });

            const updateMainStorage = await updateQuantityOfMainStorageApi(
                materialsTransfer as unknown as MaterialStorage,
            );
            const updateStatus = await updateImportRequestApi(
                selectedRequest?.id ?? '',
                senderInfo,
                receiverInfo,
                3,
                tableData,
            );
            if (updateMainStorage && updateMainStorage.data && updateStatus && updateStatus.data) {
                setSelectedRequest(null);
                setTableData([]);
                form.resetFields();
                setLoading(false);
                message.success('Nhập vật tư thành công thông tin chi tiết hãy xem ở chi tiết đơn yêu cầu');
            }
            setLoading(false);
        } catch (error) {
            message.error('Có lỗi khi nhập vật tư vui lòng thử lại');
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
            title: 'Số lượng nhập',
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
                            Nhập vật tư
                        </Title>
                        <Form form={form} layout="vertical">
                            <Form.Item name={'requestName'} label="Chọn phiếu đề nghị">
                                <Select
                                    placeholder="Chọn phiếu đề nghị"
                                    style={{ width: '100%' }}
                                    onChange={handleRequestChange}
                                >
                                    {importRequests.map((req) => (
                                        <Select.Option key={req.id} value={req.id}>
                                            {req.requestName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name={'userImport'} label="Chọn người nhập vật tư">
                                <Select
                                    placeholder="Chọn người nhập vật tư"
                                    style={{ width: '100%' }}
                                    onChange={handleChangeUserImport}
                                >
                                    {users.map((item) => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.fullName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name={'receiverInfo'} label="Chọn người nhận vật tư">
                                <Select
                                    placeholder="Chọn người nhận"
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
                        </Form>
                        {selectedRequest && (
                            <Descriptions title="Chi tiết phiếu yêu cầu" bordered column={2}>
                                <Descriptions.Item label="Tên người đề nghị">
                                    {users.find((e) => e.id === selectedRequest?.requesterName)?.fullName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên đơn yêu cầu">
                                    {selectedRequest?.requestName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kho nhận">Kho tổng</Descriptions.Item>
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
                                Tiến hành nhập vật tư
                            </Button>
                        </Card>
                    )}
                </div>
            )}
        </>
    );
};

export default Import;
