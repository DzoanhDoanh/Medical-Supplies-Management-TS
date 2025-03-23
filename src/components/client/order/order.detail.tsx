import React, { useEffect, useState } from 'react';
import { Card, InputNumber, Button, Divider, message, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import '../../../styles/order.scss';
import { useCurrentApp } from '@/components/context/app.context';
import { deleteCartByIdApi, getCartsApi, updateQuantityCart } from '@/services/api';

interface IProps {
    setCurrentStep: (v: number) => void;
}
const OrderDetail = ({ setCurrentStep }: IProps) => {
    // const [carts, setCarts] = useState<ICart[]>([]);
    const { carts, setCarts } = useCurrentApp();
    const [reset, setReset] = useState<number>(1);

    useEffect(() => {
        const fetchCarts = async () => {
            const res = await getCartsApi();
            if (res && res.data) {
                setCarts(res.data);
            }
        };
        fetchCarts();
    }, [reset]);
    const handleNextStep = () => {
        if (!carts.length) {
            message.error('Không tồn tại sản phẩm nào trong giỏ hàng.');
            return;
        }
        setCurrentStep(1);
    };
    const handleQuantityChange = async (value: number, id: string) => {
        const updatedCarts = carts.map((cart) => (cart.id === id ? { ...cart, quantity: value } : cart));
        const res = await updateQuantityCart(id, value);
        if (res && res.data) {
            setCarts(updatedCarts);
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
                                    <div className="book-quantity">
                                        <InputNumber
                                            min={1}
                                            value={item.quantity}
                                            onChange={(value) => handleQuantityChange(value as number, item.id)}
                                        />
                                    </div>
                                    <div className="book-total" style={{ color: 'red' }}>
                                        Tổng: {(item.detail.price * item.quantity).toLocaleString()} đ
                                    </div>
                                </div>
                                <DeleteOutlined className="delete-icon" onClick={() => handleDeleteItem(item.id)} />
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <div className="order-summary" style={{ backgroundColor: '#fff' }}>
                <div className="summary-row">
                    <span>Tạm tính</span>
                    <span>{totalPrice.toLocaleString()} đ</span>
                </div>
                <Divider />
                <div className="summary-row total">
                    <span>Tổng tiền</span>
                    <span>{totalPrice.toLocaleString()} đ</span>
                </div>
                <Button type="primary" danger block disabled={carts.length === 0} onClick={() => handleNextStep()}>
                    Mua Hàng ({carts.length})
                </Button>
            </div>
        </div>
    );
};

export default OrderDetail;
