/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { App, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Upload } from 'antd';
import type { FormProps } from 'antd';
import { getAllUsers, getStorageApi, getUserByIdApi, updateDepartmentApi, updateUserApi } from '@/services/api';
import { Rule } from 'antd/es/form';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface IProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IDepartment | null) => void;
    dataUpdate: IDepartment | null;
}

type FieldType = {
    name: string;
    affiliatedUnit: string;
    userId: string;
    storageId: string;
};
const { Option } = Select;
const UpdateDepartment = (props: IProps) => {
    const { openModalUpdate, setOpenModalUpdate, refreshTable, setDataUpdate, dataUpdate } = props;
    const [users, setUsers] = useState<IUser[]>([]);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { message, notification } = App.useApp();
    const [storages, setStorages] = useState<IStorage[]>([]);

    const [form] = Form.useForm();

    useEffect(() => {
        const fetchUser = async () => {
            const res = await getAllUsers();
            const fetchStorage = await getStorageApi('');
            if (res && res.data && fetchStorage && fetchStorage.data) {
                setUsers(res.data);
                setStorages(fetchStorage.data);
            }
        };
        fetchUser();
        if (dataUpdate) {
            form.setFieldsValue({
                id: dataUpdate.id,
                name: dataUpdate.name,
                affiliatedUnit: dataUpdate.affiliatedUnit,
                userId: dataUpdate.userId,
                storageId: dataUpdate.storageId,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdate]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        const user = await getUserByIdApi(values.userId);
        const res = await updateDepartmentApi(
            dataUpdate?.id ?? '',
            values.name,
            values.userId,
            user.data?.fullName ?? '',
            values.affiliatedUnit,
            values.storageId,
            dataUpdate?.createAt ?? '',
        );
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Có lỗi xảy ra vui lòng thử lại!',
                    description: alertMessage,
                });
                setIsSubmit(false);
                return;
            } else {
                message.success('Cập nhật thông tin phòng ban thành công');
                form.resetFields();
                setOpenModalUpdate(false);
                setIsSubmit(false);
                refreshTable();
            }
        }, 2000);
    };

    return (
        <>
            <Modal
                title="Cập nhật thông tin phòng ban"
                open={openModalUpdate}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                    form.resetFields();
                }}
                width={600}
                okText={'Cập nhật'}
                cancelText={'Hủy'}
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
export default UpdateDepartment;
