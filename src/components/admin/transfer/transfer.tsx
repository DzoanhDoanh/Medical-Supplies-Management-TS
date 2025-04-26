/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { message, Button, Form, Select, Table, InputNumber, Tag, Card, DatePicker } from 'antd';
import {
    checkStorageApi,
    createHandOverApi,
    getBatchWidthQueryApi,
    getStorageApi,
    getStorageByIdApi,
    getUsersApi,
    transferToAnotherStorageApi,
} from '@/services/api';

interface FieldProps {
    batch: string;
    senderInfo: string;
    receiveInfo: string;
    sendDate: string;
    storageId: string;
}
interface Material {
    key: string;
    id: string;
    name: string;
    quantity: number;
    availableQuantity: number;
}
type MaterialRequestMerge = {
    materialId: string;
    materialName: string;
    quantity: number;
};
const TransferToUser = () => {
    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [materialsList, SetMaterialsList] = useState<Material[]>([]);
    const [batches, setBatches] = useState<IBatch[]>([]);
    const [storages, setStorages] = useState<IStorage[]>([]);
    const [selectedStorage, setSelectedStorage] = useState<IStorage>();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUsersApi('');
                const storageData = await getStorageApi('&mainStorage=false');
                const batchData = await getBatchWidthQueryApi('');
                if (userData && userData.data) {
                    setUsers(userData.data);
                }
                if (storageData && storageData.data) {
                    setStorages(storageData.data);
                }
                if (batchData && batchData.data) {
                    setBatches(batchData.data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    const handleMaterialChange = (value: string[]) => {
        const newMaterials = value.map((id) => {
            const material = materialsList.find((item) => item.id === id);
            const existing = selectedMaterials.find((item) => item.key === id);

            return existing
                ? existing
                : {
                      key: id,
                      id: material!.id,
                      name: material!.name,
                      quantity: 1,
                      availableQuantity: material!.availableQuantity,
                  };
        });

        setSelectedMaterials(newMaterials);
    };

    const handleQuantityChange = (value: number, key: string) => {
        setSelectedMaterials((prev) =>
            prev.map((item) => {
                if (item.key === key) {
                    if (value > item.availableQuantity) {
                        message.error(`Số lượng yêu cầu không thể vượt quá ${item.availableQuantity}.`);
                        return item;
                    }
                    return { ...item, quantity: value };
                }
                return item;
            }),
        );
    };

    const handleDeleteMaterial = (key: string) => {
        setSelectedMaterials((prev) => prev.filter((item) => item.key !== key));
    };

    const columns = [
        { title: 'Vật tư', dataIndex: 'name', key: 'name' },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text: any, record: Material) => {
                return (
                    <InputNumber
                        min={1}
                        max={record.availableQuantity}
                        value={record.quantity}
                        onChange={(value) => handleQuantityChange(value as number, record.key)}
                    />
                );
            },
        },
        {
            title: 'Số lượng trong kho',
            key: 'storage',
            render: (text: any, record: any) => {
                const result = materialsList.find((e) => e.id === record.id);
                return <span>{result?.availableQuantity}</span>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Material) => (
                <Button danger onClick={() => handleDeleteMaterial(record.key)}>
                    Xóa
                </Button>
            ),
        },
    ];
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
    const onFinish = async (values: FieldProps) => {
        setLoading(true);
        const requestData = {
            materialRequests: selectedMaterials.map((item) => ({
                supplyId: item.id,
                materialName: item.name,
                quantity: item.quantity,
            })),
        };
        const subBase = selectedStorage?.materials.map((item) => {
            return {
                materialId: item.supplyId,
                materialName: item.materialName,
                quantity: item.quantity ?? 0,
            };
        });
        const sub = requestData.materialRequests.map((item) => {
            return {
                materialId: item.supplyId,
                materialName: item.materialName,
                quantity: item.quantity ?? 0,
            };
        });
        const materialsResult = subtractMaterialRequests(subBase ?? [], sub).map((item) => {
            return {
                supplyId: item.materialId,
                materialName: item.materialName,
                quantity: item.quantity,
            };
        });
        const check = await checkStorageApi(selectedStorage?.id ?? '', requestData.materialRequests);
        if (!check) {
            message.error(
                'Số lượng bàn giao lớn hơn số lượng đang có trong kho vui lòng refresh lại trang để cập nhật và thử lại',
            );
            form.resetFields();
            setSelectedMaterials([]);
            setLoading(false);
            return;
        }
        const senderInfo = users.find((e) => e.id === values.senderInfo);
        const receiveInfo = users.find((e) => e.id === values.receiveInfo);
        const batch = batches.find((e) => e.id === values.batch);
        const res1 = await transferToAnotherStorageApi(selectedStorage?.id ?? '', materialsResult);
        const res = await createHandOverApi(
            'Ban giao',
            { userId: senderInfo?.id ?? '', userName: senderInfo?.fullName ?? '' },
            { userId: receiveInfo?.id ?? '', userName: receiveInfo?.fullName ?? '' },
            values.sendDate,
            values.storageId,
            requestData.materialRequests,
            batch?.name ?? '',
        );
        setTimeout(() => {
            if (res && res.data && res1 && res1.data) {
                message.success('Thực hiện bàn giao cho người sử dụng thành công');
                setLoading(false);
            } else {
                message.error('Thao tác không thành công vui lòng thử lại sau');
                setLoading(false);
            }
        }, 1000);
    };
    const customTagRender = (props: any) => {
        const { label } = props;
        return <Tag style={{ marginRight: 3 }}>{label}</Tag>;
    };
    const handleStorageChange = async (value: string) => {
        const materialData = await getStorageByIdApi(value);
        if (materialData && materialData.data) {
            setSelectedStorage(materialData.data);
            const result = materialData.data.materials.map((item) => {
                return {
                    id: item.supplyId,
                    name: item.materialName,
                    availableQuantity: item.quantity,
                };
            });
            SetMaterialsList(result as []);
        }
    };
    return (
        <Card title="Bàn giao cho người sử dụng">
            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item<FieldProps>
                    label="Hãy chọn kho cần bàn giao"
                    name="storageId"
                    rules={[{ required: true, message: 'Hãy chọn kho cần bàn giao' }]}
                >
                    <Select
                        onChange={handleStorageChange}
                        style={{ width: '100%' }}
                        placeholder="Hãy chọn kho cần bàn giao"
                    >
                        {storages &&
                            storages.map((item) => {
                                return (
                                    <Select.Option key={item.id} values={item.id}>
                                        {item.name}
                                    </Select.Option>
                                );
                            })}
                    </Select>
                </Form.Item>
                <Form.Item<FieldProps>
                    label="Hãy chọn đợt cấp"
                    name="batch"
                    rules={[{ required: true, message: 'Hãy chọn đợt cấp' }]}
                >
                    <Select style={{ width: '100%' }} placeholder="Hãy chọn đợt cấp">
                        {batches &&
                            batches.map((item) => {
                                return (
                                    <Select.Option key={item.id} values={item.name}>
                                        {item.name}
                                    </Select.Option>
                                );
                            })}
                    </Select>
                </Form.Item>
                <Form.Item<FieldProps>
                    label="Người bàn giao"
                    name="senderInfo"
                    rules={[{ required: true, message: 'Vui lòng chọn người bàn giao' }]}
                >
                    <Select style={{ width: '100%' }} placeholder="Vui lòng chọn người bàn giao">
                        {users &&
                            users.map((item) => {
                                return (
                                    <Select.Option key={item.id} values={item.id}>
                                        {item.fullName}
                                    </Select.Option>
                                );
                            })}
                    </Select>
                </Form.Item>
                <Form.Item<FieldProps>
                    label="Người nhận"
                    name="receiveInfo"
                    rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}
                >
                    <Select style={{ width: '100%' }} placeholder="Vui lòng chọn người nhận">
                        {users &&
                            users.map((item) => {
                                return (
                                    <Select.Option key={item.id} values={item.id}>
                                        {item.fullName}
                                    </Select.Option>
                                );
                            })}
                    </Select>
                </Form.Item>
                <Form.Item<FieldProps>
                    label="Ngày bàn giao"
                    name="sendDate"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày bàn giao' }]}
                >
                    <DatePicker placeholder="Ngày bàn giao" />
                </Form.Item>
                <Form.Item name="materialId" label="Chọn vật tư cần yêu cầu">
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        tagRender={customTagRender}
                        placeholder="Chọn vật tư"
                        onChange={handleMaterialChange}
                    >
                        {materialsList.map((material) => (
                            <Select.Option key={material.id} value={material.id}>
                                {material.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Table
                    dataSource={selectedMaterials}
                    columns={columns}
                    rowKey="key"
                    pagination={false}
                    style={{ marginBottom: 24 }}
                />
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ marginTop: 16 }}>
                        Tiến hành bàn giao
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default TransferToUser;
