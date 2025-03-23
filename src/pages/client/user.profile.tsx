import React, { useState } from 'react';
import { Card, Avatar, Button, Modal, Form, Input, message, Descriptions } from 'antd';
import { EditOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons';

interface IUser {
    name: string;
    email: string;
    phone: string;
    address: string;
    avatar?: string;
}

const defaultUser: IUser = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    avatar: 'https://i.pravatar.cc/150?img=3',
};

const UserProfile: React.FC = () => {
    const [user, setUser] = useState<IUser>(defaultUser);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [form] = Form.useForm();

    const handleEdit = () => {
        form.setFieldsValue(user);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = () => {
        form.validateFields().then((values) => {
            setUser(values);
            setIsEditModalOpen(false);
            message.success('Cập nhật thông tin thành công');
        });
    };

    const handleLogout = () => {
        message.success('Đăng xuất thành công');
        // Thêm xử lý navigate hoặc clear localStorage nếu cần
    };

    const handleChangePassword = () => {
        message.info('Chức năng đổi mật khẩu đang phát triển');
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
            <Card
                title="Thông Tin Cá Nhân"
                actions={[
                    <Button icon={<EditOutlined />} onClick={handleEdit}>
                        Chỉnh sửa
                    </Button>,
                    <Button icon={<LockOutlined />} onClick={handleChangePassword}>
                        Đổi mật khẩu
                    </Button>,
                    <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                        Đăng xuất
                    </Button>,
                ]}
            >
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <Avatar size={200} src={user.avatar} />
                    <Descriptions column={1} style={{ flex: 1 }}>
                        <Descriptions.Item label="Họ tên">{user.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{user.phone}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{user.address}</Descriptions.Item>
                    </Descriptions>
                </div>
            </Card>

            <Modal
                title="Chỉnh sửa thông tin cá nhân"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={handleEditSubmit}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="Họ tên" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Avatar URL" name="avatar">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserProfile;
