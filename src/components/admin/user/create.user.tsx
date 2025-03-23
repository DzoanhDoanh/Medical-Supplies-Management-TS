import { registerApi } from '@/services/api';
import { App, Divider, Form, Modal, Input, Select } from 'antd';
import type { FormProps } from 'antd';
import { useState } from 'react';
import { Rule } from 'antd/es/form';

interface IProps {
    openModalCreate: boolean;
    setOpenModalCreate: (v: boolean) => void;
    refreshTable: () => void;
}
type FieldType = {
    fullName: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
};
const { Option } = Select;
const CreateUser = (props: IProps) => {
    const { openModalCreate, setOpenModalCreate, refreshTable } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    const [form] = Form.useForm();
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const { fullName, password, email, phone, role } = values;
        setIsSubmit(true);
        const res = await registerApi(fullName, email, password, phone, role);
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
                message.success('Create user success!');
                form.resetFields();
                setOpenModalCreate(false);
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
                title="Add new user"
                open={openModalCreate}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalCreate(false);
                    form.resetFields();
                }}
                okText={'Create'}
                cancelText="Cancel"
                confirmLoading={isSubmit}
            >
                <Divider />
                <Form form={form} name="basic" style={{ maxWidth: 600 }} onFinish={onFinish} autoComplete="off">
                    <Form.Item<FieldType> labelCol={{ span: 24 }} label="Name" name="fullName" rules={nameRules}>
                        <Input placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item<FieldType> labelCol={{ span: 24 }} label="Email" name="email" rules={emailRules}>
                        <Input type="email" placeholder="Enter email" />
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
export default CreateUser;
