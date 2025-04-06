/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDepartmentApi, getAllUsers, getStorageApi, getUserByIdApi, registerApi } from '@/services/api';
import { App, Divider, Form, Modal, Input, Select, DatePicker, Upload, Row, Col } from 'antd';
import type { FormProps } from 'antd';
import { useEffect, useState } from 'react';
import { Rule } from 'antd/es/form';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
    openModalCreate: boolean;
    setOpenModalCreate: (v: boolean) => void;
    refreshTable: () => void;
}
type FieldType = {
    name: string;
    affiliatedUnit: string;
    userId: string;
    storageId: string;
};
const { Option } = Select;
const CreateDepartment = (props: IProps) => {
    const { openModalCreate, setOpenModalCreate, refreshTable } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [users, setUsers] = useState<IUser[]>([]);
    const [storages, setStorages] = useState<IStorage[]>([]);
    const { message, notification } = App.useApp();

    const [form] = Form.useForm();
    useEffect(() => {
        const fetchData = async () => {
            const res = await getAllUsers();
            const fetchStorage = await getStorageApi('');
            if (res && res.data && fetchStorage && fetchStorage.data) {
                setUsers(res.data);
                setStorages(fetchStorage.data);
            }
        };
        fetchData();
    }, []);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        const user = await getUserByIdApi(values.userId);
        if (user && user.data) {
            const res = await createDepartmentApi(
                values.name,
                values.userId,
                user.data.fullName,
                values.affiliatedUnit,
                values.storageId,
            );
            setTimeout(() => {
                if (res && res.data && typeof res.data === 'string') {
                    const alertMessage = res.data + '';
                    notification.error({
                        message: 'Has an error!',
                        description: alertMessage,
                    });
                    setIsSubmit(false);
                    return;
                } else {
                    message.success('Tạo mới phòng ban thành công!');
                    form.resetFields();
                    setOpenModalCreate(false);
                    setIsSubmit(false);
                    refreshTable();
                }
            }, 2000);
        }
    };
    return (
        <>
            <Modal
                title="Thêm mới phòng ban"
                open={openModalCreate}
                width={600}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalCreate(false);
                    form.resetFields();
                }}
                okText={'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={isSubmit}
            >
                <Divider />
                <Form form={form} name="basic" onFinish={onFinish} autoComplete="off">
                    <Row gutter={[16, 16]}>
                        <Col span={24} md={24} xs={24}>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Tên phòng ban"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng điền tên phòng ban' }]}
                            >
                                <Input placeholder="Vui lòng điền tên phòng ban" />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Đơn vị trực thuộc"
                                name="affiliatedUnit"
                                rules={[{ required: true, message: 'Vui lòng điền đơn vị trực thuộc' }]}
                            >
                                <Input type="email" placeholder="Vui lòng điền đơn vị trực thuộc" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Vui lòng chọn tên người phụ trách"
                                name="userId"
                                rules={[{ required: true, message: 'Vui lòng chọn người phụ trách' }]}
                            >
                                <Select placeholder="Hãy chọn người phụ trách phòng ban" allowClear>
                                    {users &&
                                        users.map((item) => {
                                            return <Option value={item.id}>{item.fullName}</Option>;
                                        })}
                                </Select>
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Vui lòng chọn kho quản lý"
                                name="storageId"
                                rules={[{ required: true, message: 'Vui lòng chọn kho quản lý' }]}
                            >
                                <Select placeholder="Hãy chọn kho quản lý" allowClear>
                                    {storages &&
                                        storages.map((item) => {
                                            return <Option value={item.id}>{item.name}</Option>;
                                        })}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};
export default CreateDepartment;
