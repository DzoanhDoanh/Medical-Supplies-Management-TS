import React, { useEffect, useState } from 'react';
import { Card, Button, Divider, message, Empty, Radio, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import '../../../styles/order.scss';
import { useCurrentApp } from '@/components/context/app.context';
import type { FormProps } from 'antd';
import { Form, Input } from 'antd';
import { deleteCartByIdApi, getCartsApi, postOrderApi } from '@/services/api';

type FieldType = {
    option: string;
    fullName?: string;
    phone?: string;
    address?: string;
};
const { TextArea } = Input;
interface IProps {
    setCurrentStep: (v: number) => void;
    setOrderId: (v: string) => void;
}
const Payment = ({ setCurrentStep, setOrderId }: IProps) => {
    const { carts, setCarts } = useCurrentApp();
    const [reset, setReset] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useCurrentApp();

    useEffect(() => {
        const fetchCarts = async () => {
            const res = await getCartsApi();
            if (res && res.data) {
                setCarts(res.data);
            }
        };
        fetchCarts();
    }, [reset]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setLoading(true);
        if (!values) {
            return;
        }
        try {
            const res = await postOrderApi(
                user?.id ?? '',
                values.address ?? '',
                carts,
                values.fullName ?? '',
                values.phone ?? '',
                totalPrice,
                values.option,
            );
            if (res && res.data) {
                message.success('Đặt hàng thành công');
                setOrderId(res.data.id);
                setCurrentStep(2);
                setLoading(false);
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
            message.error('Có lỗi xảy ra khi đặt hàng');
        }
    };

    const handleDeleteItem = async (id: string) => {
        try {
            const res = await deleteCartByIdApi(id);
            if (res && res.status === 200) {
                message.success('Đã xóa sản phẩm khỏi giỏ hàng');
                setReset((reset) => reset + 1);
            } else {
                message.error('Thao tác thất bại');
            }
        } catch (error) {
            console.log(error);
            message.error('Thao tác thất bại');
        }
        message.success('Xóa sản phẩm khỏi giỏ hàng');
    };

    const totalPrice = carts.reduce((acc, item) => acc + item.detail.price * item.quantity, 0);
    if (loading) {
        return <Spin fullscreen></Spin>;
    }

    return (
        <div className="order-container">
            <div className="order-left">
                {carts.length === 0 ? (
                    <Empty description="Không có sản phẩm trong giỏ hàng" />
                ) : (
                    carts.map((item) => (
                        <Card key={item.id} className="order-item">
                            <div className="order-item-wrapper">
                                <img src={item.detail.thumbnail} alt={item.detail.mainText} className="book-image" />
                                <div className="book-details">
                                    <div className="book-title">{item.detail.mainText}</div>
                                    <div className="book-price">Giá tiền: {item.detail.price.toLocaleString()} đ</div>
                                    <div className="book-quantity">Số lượng: {item.quantity}</div>
                                    <div className="book-total" style={{ color: 'red' }}>
                                        Tổng: {(item.detail.price * item.quantity).toLocaleString()} đ
                                    </div>
                                </div>
                                <DeleteOutlined className="delete-icon" onClick={() => handleDeleteItem(item.id)} />
                            </div>
                        </Card>
                    ))
                )}
                <Button type="text" style={{ width: '100px' }} onClick={() => setCurrentStep(0)}>
                    {`<<`} Quay lại
                </Button>
            </div>

            <div className="order-summary" style={{ backgroundColor: '#fff' }}>
                <Form name="payment" onFinish={onFinish} layout="vertical">
                    <Form.Item<FieldType> label="Hình thức thanh toán" name="option" initialValue={1}>
                        <Radio.Group>
                            <Radio value="COD"> Thanh toán khi nhận hàng </Radio>
                            <Radio value="VNPAY"> Thanh toán qua ví VNPay </Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item<FieldType>
                        label="Họ tên"
                        name="fullName"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType>
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng' }]}
                    >
                        <TextArea />
                    </Form.Item>
                    <div className="summary-row">
                        <span>Tạm tính</span>
                        <span>{totalPrice.toLocaleString()} đ</span>
                    </div>
                    <Divider />
                    <div className="summary-row total">
                        <span>Tổng tiền</span>
                        <span>{totalPrice.toLocaleString()} đ</span>
                    </div>
                    <Button type="primary" htmlType="submit" danger block disabled={carts.length === 0}>
                        Đặt hàng ({carts.length})
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default Payment;
