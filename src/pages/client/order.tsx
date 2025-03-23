import OrderDetail from '@/components/client/order/order.detail';
import Payment from '@/components/client/order/payment';
import PaymentSuccess from '@/components/client/order/payment.success';
import { Steps } from 'antd';
import { useState } from 'react';

const OrderPage = () => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [orderId, setOrderId] = useState<string>('')
    return (
        <div>
            <div className="order-container">
                <Steps
                    size="small"
                    current={currentStep}
                    items={[{ title: 'Đơn hàng' }, { title: 'Đặt hàng' }, { title: 'Thanh toán' }]}
                ></Steps>
            </div>
            {currentStep === 0 && <OrderDetail setCurrentStep={setCurrentStep} />}
            {currentStep === 1 && <Payment setCurrentStep={setCurrentStep} setOrderId={setOrderId} />}
            {currentStep === 2 && <PaymentSuccess orderId={orderId}/>}
        </div>
    );
};
export default OrderPage;
