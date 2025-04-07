/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Input, message, Button, Form, Select, Table, InputNumber } from 'antd';
import {
    createMaterialRequestsApi,
    getDepartmentsApi,
    getStorageApi,
    getStorageByIdApi,
    getSuppliesApi,
    getUsersApi,
} from '@/services/api';

interface IProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
}
interface FieldProps {
    requesterName: string;
    requestName: string;
    type: string;
    materialId: string;
    departmentId: string;
}
interface Material {
    key: string;
    id: string;
    name: string;
    quantity: number;
    availableQuantity: number;
}

const MedicalSuppliesRequest = () => {
    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [materialsList, SetMaterialsList] = useState<Material[]>([]);
    const [storages, setStorages] = useState<IStorage[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUsersApi('');
                const materialData = await getStorageByIdApi('5Hqqg5d33');
                const storageData = await getStorageApi('&mainStorage=false');
                if (userData && userData.data) {
                    setUsers(userData.data);
                }
                if (materialData && materialData.data) {
                    const result = materialData.data.materials.map((item) => {
                        return {
                            id: item.supplyId,
                            name: item.materialName,
                            availableQuantity: item.quantity,
                        };
                    });
                    SetMaterialsList(result as []);
                }
                if (storageData && storageData.data) {
                    setStorages(storageData.data);
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

    const onFinish = async (values: FieldProps) => {
        setLoading(true);

        const requestData = {
            requesterInfo: {
                requesterName: values.requesterName,
                departmentId: values.departmentId,
                type: values.type,
            },
            materialRequests: selectedMaterials.map((item) => ({
                materialId: item.id,
                materialName: item.name,
                quantity: item.quantity,
            })),
        };
        try {
            const res = await createMaterialRequestsApi(
                values.requestName,
                requestData.requesterInfo,
                requestData.materialRequests,
            );
            if (res && res.data) {
                message.success('Yêu cầu cung cấp vật tư đã được gửi thành công!');
                setLoading(false);
                form.resetFields();
                setSelectedMaterials([]);
            } else {
                message.error('Có lỗi xảy ra vui lòng thử lại');
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 50 }}>
            <h1 style={{ marginBottom: '20px' }}>Tạo Phiếu Yêu Cầu Vật Tư</h1>
            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item
                    label="Tên người yêu cầu"
                    name="requesterName"
                    rules={[{ required: true, message: 'Vui lòng chọn tên người yêu cầu' }]}
                >
                    <Select style={{ width: '100%' }} placeholder="Vui lòng chọn tên người yêu cầu">
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
                <Form.Item
                    label="Kho nhận vật tư"
                    name="departmentId"
                    rules={[{ required: true, message: 'Vui lòng chọn kho nhận vật tư' }]}
                >
                    <Select style={{ width: '100%' }} placeholder="Vui lòng chọn kho nhận vật tư">
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
                <Form.Item
                    label="Tên phiếu yêu cầu"
                    name="requestName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên phiếu yêu cầu' }]}
                >
                    <Input placeholder="Vui lòng nhập tên phiếu yêu cầu" />
                </Form.Item>
                <Form.Item
                    label="Chọn mức độ ưu tiên"
                    name="type"
                    rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
                >
                    <Select style={{ width: '100%' }} placeholder="Mức độ ưu tiên">
                        <Select.Option key={0} values={0}>
                            Cao
                        </Select.Option>
                        <Select.Option key={1} values={1}>
                            Trung bình
                        </Select.Option>
                        <Select.Option key={2} values={2}>
                            Thấp
                        </Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="materialId" label="Chọn vật tư cần yêu cầu">
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
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
                        Gửi Yêu Cầu
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default MedicalSuppliesRequest;
