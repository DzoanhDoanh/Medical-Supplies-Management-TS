/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import { Rule } from 'antd/es/form';
import { useNavigate } from 'react-router-dom';
import './register.scss';
import { registerApi } from '@/services/api';

const RegisterPage: React.FC = () => {
    const { message } = App.useApp();
    const [isSubmit, setIsSubmit] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setIsSubmit(true);
        const { email, name, password, phone } = values;
        const res = await registerApi(name, email, password, phone);
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                message.error(alertMessage);
                setIsSubmit(false);
                return;
            }
            message.success('Đăng ký thành công!');
            navigate('/login');
            setIsSubmit(false);
        }, 2000);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.error('Form Submission Failed:', errorInfo);
    };

    // Validation rules
    const nameRules: Rule[] = [{ required: true, message: 'Họ tên không được để trống' }];
    const emailRules: Rule[] = [
        { required: true, message: 'Email không được để trống' },
        { type: 'email', message: 'Email không hợp lệ' },
    ];
    const passwordRules: Rule[] = [{ required: true, message: 'Mật khẩu không được để trống' }];
    const phoneRules: Rule[] = [
        { required: true, message: 'Số điện thoại không được để trống' },
        { pattern: /^\d{10,11}$/, message: 'Số điện thoại phải gồm 10-11 chữ số' },
    ];
    const handleSwitchToLogin = () => {
        navigate('/login');
    };
    return (
        <div className="register-wrapper">
            <div className="register-form">
                <h1 className="form-title">Đăng Ký Tài Khoản</h1>
                <Form
                    name="register"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    layout="vertical"
                >
                    <Form.Item label="Họ Tên" name="name" rules={nameRules}>
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>

                    <Form.Item label="Email" name="email" rules={emailRules}>
                        <Input type="email" placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item label="Mật Khẩu" name="password" rules={passwordRules}>
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item label="Số Điện Thoại" name="phone" rules={phoneRules}>
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={isSubmit}>
                            Đăng Ký
                        </Button>
                    </Form.Item>
                </Form>
                <span className="line"></span>
                <p className="text">Hoặc</p>
                <p className="text">
                    Đã có tài khoản?
                    <span className="login-button" onClick={handleSwitchToLogin}>
                        &nbsp;Đăng nhập
                    </span>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
