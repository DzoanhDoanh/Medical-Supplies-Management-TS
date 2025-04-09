/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Input, message, Button, Form, Select, Table, InputNumber, Tag } from 'antd';
import { createImportRequestsApi, getSuppliesApi, getUsersApi, updateQuantitySupplyApi } from '@/services/api';

interface FieldProps {
    requesterName: string;
    requestName: string;
    materialId: string;
}
interface Material {
    key: string;
    id: string;
    name: string;
    quantity: number;
}

const ImportExistingMaterial = () => {
    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [materialsList, SetMaterialsList] = useState<Material[]>([]);
    const [allMaterials, setAllMaterials] = useState<ISupplies[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUsersApi('');
                const materialData = await getSuppliesApi('');

                if (userData && userData.data) {
                    setUsers(userData.data);
                }
                if (materialData && materialData.data) {
                    const result = materialData.data.map((item) => ({
                        id: item.id,
                        name: item.name,
                    }));
                    SetMaterialsList(result as []);
                    setAllMaterials(materialData.data);
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
                  };
        });

        setSelectedMaterials(newMaterials);
    };

    const handleQuantityChange = (value: number, key: string) => {
        setSelectedMaterials((prev) => prev.map((item) => (item.key === key ? { ...item, quantity: value } : item)));
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
            render: (text: any, record: Material) => (
                <InputNumber
                    min={1}
                    value={record.quantity}
                    onChange={(value) => handleQuantityChange(value as number, record.key)}
                />
            ),
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
            requesterName: values.requesterName,
            requestName: values.requestName,
            materialRequests: selectedMaterials.map((item) => ({
                materialId: item.id,
                materialName: item.name,
                quantity: item.quantity,
            })),
        };
        try {
            for (const item of requestData.materialRequests) {
                const material = allMaterials.find((e) => e.id === item.materialId);
                if (material) {
                    const quantity = material.quantity + (item.quantity ?? 0);
                    await updateQuantitySupplyApi(item.materialId, quantity);
                }
            }
            const res = await createImportRequestsApi(
                values.requestName,
                values.requesterName,
                requestData.materialRequests,
            );
            if (res && res.data) {
                message.success('Nhập vật tư thành công!');
                form.resetFields();
                setSelectedMaterials([]);
            } else {
                message.error('Có lỗi xảy ra, vui lòng thử lại.');
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }

        setLoading(false);
    };
    const customTagRender = (props: any) => {
        const { label } = props;
        return (
            <Tag style={{ marginRight: 3 }}>
                {label} {/* Không hiển thị nút X */}
            </Tag>
        );
    };
    return (
        <div>
            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item
                    label="Người đề nghị"
                    name="requesterName"
                    rules={[{ required: true, message: 'Vui lòng chọn tên người đề nghị' }]}
                >
                    <Select style={{ width: '100%' }} placeholder="Chọn người đề nghị">
                        {users.map((user) => (
                            <Select.Option key={user.id} value={user.id}>
                                {user.fullName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Tên đề nghị"
                    name="requestName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề nghị' }]}
                >
                    <Input placeholder="Nhập tên đề nghị" />
                </Form.Item>
                <Form.Item label="Chọn vật tư cần mua" name="materialId">
                    <Select
                        mode="multiple"
                        tagRender={customTagRender}
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
                <Table dataSource={selectedMaterials} columns={columns} rowKey="key" pagination={false} />
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ marginTop: '20px' }}>
                        Tiến hành gửi đề nghị mua
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ImportExistingMaterial;
