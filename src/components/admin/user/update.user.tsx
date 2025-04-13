/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { App, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Upload } from 'antd';
import type { FormProps } from 'antd';
import { getDepartmentsApi, updateUserApi } from '@/services/api';
import { Rule } from 'antd/es/form';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface IProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IUser | null) => void;
    dataUpdate: IUser | null;
}

type FieldType = {
    id: string;
    fullName: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
    departIdentity: string;
    position: string;
    gender: string;
    dateOfBirth: string;
    address: string;
};
const { Option } = Select;
const UpdateUser = (props: IProps) => {
    const { openModalUpdate, setOpenModalUpdate, refreshTable, setDataUpdate, dataUpdate } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { message, notification } = App.useApp();
    const [previewOpenAvatar, setPreviewOpenAvatar] = useState(false);
    const [previewImageAvatar, setPreviewImageAvatar] = useState<string>('');
    const [departs, setDeparts] = useState<IDepartment[]>([]);
    const [fileListAvatar, setFileListAvatar] = useState<any[]>([]);
    // Xử lý hiển thị ảnh preview
    const handlePreview = async (file: any) => {
        setPreviewImageAvatar(file.avatarUrl || file.url);
        setPreviewOpenAvatar(true);
    };

    // Xử lý thêm file vào danh sách (không gửi lên server ngay)
    const handleChange = ({ fileList }: any) => {
        setFileListAvatar(fileList);
    };
    const normFile = (e: any) => {
        console.log('File event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };
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
                departIdentity: dataUpdate.departIdentity,
                position: dataUpdate.position,
                gender: dataUpdate.gender,
                dateOfBirth: dayjs(dataUpdate.dateOfBirth),
                address: dataUpdate.address,
            });
        }
        const fetchDepart = async () => {
            const res = await getDepartmentsApi('');
            if (res && res.data) {
                setDeparts(res.data);
            }
        };
        fetchDepart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdate]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        if (fileListAvatar.length === 0) {
            const res = await updateUserApi(
                values.id,
                values.email,
                values.password,
                values.fullName,
                values.phone,
                values.role,
                values.departIdentity,
                values.position,
                values.gender,
                values.dateOfBirth,
                values.address,
                'user.png',
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
                    message.success('Cập nhật thông tin nhân viên thành công');
                    form.resetFields();
                    setOpenModalUpdate(false);
                    setIsSubmit(false);
                    refreshTable();
                }
            }, 2000);
            return;
        }
        const fileObj = fileListAvatar[0].originFileObj;
        // Chuyển file thành base64
        const reader = new FileReader();
        reader.readAsDataURL(fileObj);
        const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
        const res = await updateUserApi(
            values.id,
            values.email,
            values.password,
            values.fullName,
            values.phone,
            values.role,
            values.departIdentity,
            values.position,
            values.gender,
            values.dateOfBirth,
            values.address,
            base64,
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
                message.success('Cập nhật thông tin nhân viên thành công');
                form.resetFields();
                setOpenModalUpdate(false);
                setIsSubmit(false);
                refreshTable();
            }
        }, 2000);
    };

    const nameRules: Rule[] = [{ required: true, message: 'Vui lòng nhập họ tên' }];
    const emailRules: Rule[] = [
        { required: true, message: 'Vui lòng nhập email' },
        { type: 'email', message: 'Email không hợp lệ' },
    ];
    const passwordRules: Rule[] = [{ required: true, message: 'Vui lòng nhập mật khẩu' }];
    const phoneRules: Rule[] = [
        { required: true, message: 'Vui lòng nhập số điện thoại' },
        { pattern: /^\d{10,11}$/, message: 'Số điện thoại gồm các ký tự số và có 10 chữ số' },
    ];
    const addressRule: Rule[] = [{ required: true, message: 'Vui lòng nhập địa chỉ' }];
    const dateRule: Rule[] = [{ required: true, message: 'Vui lòng nhập ngày sinh' }];
    return (
        <>
            <Modal
                title="Cập nhật thông tin nhân viên"
                open={openModalUpdate}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                    form.resetFields();
                }}
                width={1000}
                okText={'Cập nhật'}
                cancelText={'Hủy'}
                confirmLoading={isSubmit}
            >
                <Divider />
                <Form form={form} name="basic" onFinish={onFinish} autoComplete="off">
                    <Row gutter={[16, 16]}>
                        <Col span={12} md={12} xs={24}>
                            <Form.Item<FieldType> hidden labelCol={{ span: 24 }} label="ID" name="id" rules={nameRules}>
                                <Input placeholder="Enter ID" disabled />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Họ tên"
                                name="fullName"
                                rules={nameRules}
                            >
                                <Input placeholder="Vui lòng điền tên nhân viên" />
                            </Form.Item>
                            <Form.Item<FieldType> labelCol={{ span: 24 }} label="Email" name="email" rules={emailRules}>
                                <Input type="email" placeholder="Vui lòng điền email" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Mật khẩu"
                                name="password"
                                rules={passwordRules}
                            >
                                <Input.Password placeholder="Vui lòng điền mật khẩu" />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select placeholder="Hãy chọn vai trò cho tài khoản này" allowClear>
                                    <Option value="user">USER</Option>
                                    <Option value="manager">QUẢN LÝ KHO</Option>
                                    <Option value="admin">ADMIN</Option>
                                    <Option value="head">TRƯỞNG TRẠM Y TẾ</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Số điện thoại"
                                name="phone"
                                rules={phoneRules}
                            >
                                <Input placeholder="Vui lòng nhập số điện thoại" />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Địa chỉ"
                                name="address"
                                rules={addressRule}
                            >
                                <Input placeholder="Vui lòng nhập địa chỉ" />
                            </Form.Item>
                        </Col>
                        <Col span={12} md={12} xs={24}>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Ngày sinh"
                                name="dateOfBirth"
                                rules={dateRule}
                            >
                                <DatePicker />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Giới tính"
                                name="gender"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                            >
                                <Select placeholder="Hãy chọn giới tính" allowClear>
                                    <Option value="Nam">Nam</Option>
                                    <Option value="Nữ">Nữ</Option>
                                    <Option value="Khác">Khác</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Phòng ban"
                                name="departIdentity"
                                rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
                            >
                                <Select placeholder="Hãy chọn phòng ban" allowClear>
                                    {departs &&
                                        departs.map((item) => {
                                            return (
                                                <Option key={item.id} value={item.id}>
                                                    {item.name}
                                                </Option>
                                            );
                                        })}
                                </Select>
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Chức vụ"
                                name="position"
                                rules={[{ required: true, message: 'Vui lòng nhập chức vụ' }]}
                            >
                                <Input placeholder="Vui lòng nhập chức vụ" />
                            </Form.Item>
                            <Form.Item
                                label="Ảnh đại diện"
                                name="avatar"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                            >
                                <Upload
                                    listType="picture-card"
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    fileList={fileListAvatar}
                                    beforeUpload={() => false}
                                    maxCount={1}
                                    multiple
                                >
                                    {fileListAvatar.length >= 8 ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Chọn file</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};
export default UpdateUser;
