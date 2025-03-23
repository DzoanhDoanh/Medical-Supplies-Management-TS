import CurrencyFormatter from '@/components/currencyFormatter/currency.formatter';
import { FORMAT_DATE_VN } from '@/services/helper';
import { Descriptions, Divider, Drawer } from 'antd';
import dayjs from 'dayjs';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IOrder | null;
    setDataViewDetail: (v: IOrder | null) => void;
}

const DetailOrder = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };

    return (
        <>
            <Drawer title="View Detail" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Order information" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Fullname">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Address">{dataViewDetail?.address}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{dataViewDetail?.phone}</Descriptions.Item>
                    <Descriptions.Item label="CreateAt">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total">
                        <CurrencyFormatter value={dataViewDetail?.totalPrice ?? 0}></CurrencyFormatter>
                    </Descriptions.Item>
                    <Descriptions.Item label="Type">{dataViewDetail?.type}</Descriptions.Item>
                </Descriptions>
                <Divider />
                <Descriptions title="Product detail" bordered column={2}>
                    {dataViewDetail?.detail.map((item) => {
                        return (
                            <>
                                <Descriptions.Item label="Book name">{item.detail.mainText}</Descriptions.Item>
                                <Descriptions.Item label="Quantity">{item.detail.quantity}</Descriptions.Item>
                            </>
                        );
                    })}
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailOrder;
