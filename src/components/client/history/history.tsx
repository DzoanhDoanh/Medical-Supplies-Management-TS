import React, { useEffect, useState } from 'react';
import { Card, Collapse, Tag, Descriptions, Divider, Empty } from 'antd';
import { ShoppingCartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useCurrentApp } from '@/components/context/app.context';
import { getOrderByUserId } from '@/services/api';

const { Panel } = Collapse;

// Trạng thái màu sắc
// const getStatusTag = (status: string) => {
//     switch (status) {
//         case 'Đã giao hàng':
//             return <Tag color="green">Đã giao hàng</Tag>;
//         case 'Đang xử lý':
//             return <Tag color="orange">Đang xử lý</Tag>;
//         case 'Đã hủy':
//             return <Tag color="red">Đã hủy</Tag>;
//         default:
//             return <Tag>{status}</Tag>;
//     }
// };

const History: React.FC = () => {
    const { user } = useCurrentApp();
    const [orders, setOrders] = useState<IOrder[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const res = await getOrderByUserId(user?.id || '');
            if (res && res.data) {
                setOrders(res.data);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Card className="shadow-xl rounded-2xl max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">
                    <ShoppingCartOutlined className="me-2" />
                    Lịch sử mua hàng
                </h2>

                {orders.length === 0 ? (
                    <Empty description="Bạn chưa có đơn hàng nào" />
                ) : (
                    <Collapse accordion bordered={false}>
                        {orders.map((order) => (
                            <Panel
                                header={
                                    <div className="flex justify-between items-center w-full">
                                        <span className="font-medium text-base">🧾 Mã đơn: {order.id}</span>
                                        <div className="flex items-center gap-4">
                                            <span>
                                                <ClockCircleOutlined className="me-1" />
                                                {order.createAt}
                                            </span>
                                        </div>
                                    </div>
                                }
                                key={order.id}
                            >
                                <Descriptions column={1} size="small" bordered>
                                    <Descriptions.Item label="Ngày đặt">{order.createAt}</Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color="green">Đã giao hàng</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tổng tiền">
                                        <span className="font-semibold text-green-600">
                                            {order.totalPrice.toLocaleString()} VND
                                        </span>
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider>Danh sách sản phẩm</Divider>
                                {order.detail.map((item, index) => (
                                    <div key={index} className="flex justify-between border-b py-2 text-sm">
                                        <span>
                                            {item.detail.mainText} (x{item.quantity})
                                        </span>
                                    </div>
                                ))}
                            </Panel>
                        ))}
                    </Collapse>
                )}
            </Card>
        </div>
    );
};

export default History;
