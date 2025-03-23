import { useEffect, useState } from 'react';
import { App, Divider, Form, Input, Modal, Select } from 'antd';
import type { FormProps } from 'antd';
import { updateUserApi } from '@/services/api';
import { Rule } from 'antd/es/form';

interface IProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IUser | null) => void;
    dataUpdate: IUser | null;
}

type FieldType = {
    id: string;
    email: string;
    fullName: string;
    password: string;
    phone: string;
    role: string;
    avatar?: string;
};
const { Option } = Select;
const UpdateUser = (props: IProps) => {
    const { openModalUpdate, setOpenModalUpdate, refreshTable, setDataUpdate, dataUpdate } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                id: dataUpdate.id,
                fullName: dataUpdate.fullName,
                password: dataUpdate.originalPass,
                email: dataUpdate.email,
                phone: dataUpdate.phone,
                role: dataUpdate.role,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdate]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const { id, fullName, email, password, role, phone } = values;
        setIsSubmit(true);
        const res = await updateUserApi(id, email, password, fullName, phone, role);
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
                message.success('Update user success!');
                form.resetFields();
                setOpenModalUpdate(false);
                setIsSubmit(false);
                refreshTable();
            }
        }, 2000);
    };

    const nameRules: Rule[] = [{ required: true, message: 'Name is required' }];
    const emailRules: Rule[] = [
        { required: true, message: 'Email is required' },
        { type: 'email', message: 'Invalid email' },
    ];
    const passwordRules: Rule[] = [{ required: true, message: 'Password is required' }];
    const phoneRules: Rule[] = [
        { required: true, message: 'Phone is required' },
        { pattern: /^\d{10,11}$/, message: 'Phone number must be 10-11 digits' },
    ];
    return (
        <>
            <Modal
                title="Update user"
                open={openModalUpdate}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                    form.resetFields();
                }}
                okText={'Update'}
                cancelText={'Cancel'}
                confirmLoading={isSubmit}
            >
                <Divider />
                <Form form={form} name="basic" style={{ maxWidth: 600 }} onFinish={onFinish} autoComplete="off">
                    <Form.Item<FieldType> hidden labelCol={{ span: 24 }} label="ID" name="id" rules={nameRules}>
                        <Input placeholder="Enter ID" disabled />
                    </Form.Item>
                    <Form.Item<FieldType> labelCol={{ span: 24 }} label="Name" name="fullName" rules={nameRules}>
                        <Input placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item<FieldType> labelCol={{ span: 24 }} label="Email" name="email" rules={emailRules}>
                        <Input type="email" placeholder="Enter email" disabled />
                    </Form.Item>

                    <Form.Item<FieldType>
                        labelCol={{ span: 24 }}
                        label="Password"
                        name="password"
                        rules={passwordRules}
                    >
                        <Input.Password placeholder="Enter password" />
                    </Form.Item>
                    <Form.Item<FieldType> labelCol={{ span: 24 }} name="role" label="Role" rules={[{ required: true }]}>
                        <Select placeholder="Select role for this account" allowClear>
                            <Option value="user">USER</Option>
                            <Option value="admin">ADMIN</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item<FieldType> labelCol={{ span: 24 }} label="Phone number" name="phone" rules={phoneRules}>
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default UpdateUser;
