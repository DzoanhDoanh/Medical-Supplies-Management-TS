/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, App } from 'antd';
import { Rule } from 'antd/es/form';
import { useNavigate } from 'react-router-dom';
import './login.scss';
import { loginApi } from '@/services/api';
import { useCurrentApp } from '@/components/context/app.context';

const Login: React.FC = () => {
    const { message, notification } = App.useApp();
    const [isSubmit, setIsSubmit] = useState(false);
    const navigate = useNavigate();
    const { setIsAuthenticated, setUser, isAuthenticated } = useCurrentApp();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
            return;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onFinish = async (values: any) => {
        setIsSubmit(true);
        const { email, password } = values;
        const res = await loginApi(email, password);
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: alertMessage,
                    duration: 5,
                });
                setIsSubmit(false);
                return;
            }
            if (res.data && res.data.user) {
                setUser(res.data.user);
            }
            setIsAuthenticated(true);
            localStorage.setItem('accessToken', res.data?.accessToken + '');
            message.success('Đăng nhập thành công!');
            navigate('/');
            setIsSubmit(false);
        }, 2000);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.error('Form Submission Failed:', errorInfo);
    };

    // Validation rules
    const emailRules: Rule[] = [
        { required: true, message: 'Email không được để trống' },
        { type: 'email', message: 'Email không hợp lệ' },
    ];
    const passwordRules: Rule[] = [{ required: true, message: 'Mật khẩu không được để trống' }];
    const handleSwitchToRegister = () => {
        navigate('/register');
    };
    return (
        <div className="register-wrapper">
            <div className="register-form">
                <h1 className="form-title">Đăng nhập</h1>
                <Form
                    name="register"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    layout="vertical"
                >
                    <Form.Item label="Email" name="email" rules={emailRules}>
                        <Input type="email" placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item label="Mật Khẩu" name="password" rules={passwordRules}>
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={isSubmit}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
                <span className="line"></span>
                <p className="text">Hoặc</p>
                <p className="text">
                    Chưa có tài khoản?
                    <span className="login-button" onClick={handleSwitchToRegister}>
                        &nbsp;Đăng ký
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
