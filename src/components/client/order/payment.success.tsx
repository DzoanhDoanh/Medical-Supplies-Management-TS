import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Descriptions } from 'antd';
import { SmileOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getOrderById } from '@/services/api';

interface IProps {
    orderId: string;
}
const OrderSuccess = ({ orderId }: IProps) => {
    const navigate = useNavigate();
    const [currentOrder, setCurrentOrder] = useState<IOrder>();

    const handleContinueShopping = () => {
        navigate('/');
    };

    useEffect(() => {
        const fetchOrder = async () => {
            if (orderId) {
                const res = await getOrderById(orderId);
                if (res && res.data) {
                    setCurrentOrder(res.data);
                }
            }
        };
        fetchOrder();
    }, [currentOrder]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="max-w-2xl w-full shadow-lg rounded-2xl">
                <Result
                    icon={<SmileOutlined style={{ color: '#52c41a' }} />}
                    title={<span className="text-2xl font-semibold text-green-600">Đặt hàng thành công!</span>}
                    subTitle="Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đang được xử lý."
                    extra={[
                        <Button
                            type="primary"
                            icon={<HomeOutlined />}
                            size="large"
                            onClick={handleContinueShopping}
                            key="continue"
                        >
                            Tiếp tục mua sắm
                        </Button>,
                    ]}
                />
                <Descriptions title="Thông tin đơn hàng" bordered column={1} className="mt-4" size="middle">
                    <Descriptions.Item label="Mã đơn hàng">{currentOrder?.id}</Descriptions.Item>
                    <Descriptions.Item label="Khách hàng">{currentOrder?.name}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{currentOrder?.phone}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                        {currentOrder?.totalPrice.toLocaleString()} VND
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">{currentOrder?.type}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default OrderSuccess;
