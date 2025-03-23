import CurrencyFormatter from '@/components/currencyFormatter/currency.formatter';
import { FORMAT_DATE_VN } from '@/services/helper';
import { Avatar, Badge, Descriptions, Divider, Drawer, Image } from 'antd';
import dayjs from 'dayjs';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IBook | null;
    setDataViewDetail: (v: IBook | null) => void;
}

const DetailBook = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };

    return (
        <>
            <Drawer title="View Detail" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Book information" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Book name">{dataViewDetail?.mainText}</Descriptions.Item>
                    <Descriptions.Item label="Author">{dataViewDetail?.author}</Descriptions.Item>
                    <Descriptions.Item label="Price">
                        <CurrencyFormatter value={dataViewDetail?.price || 0} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Category">
                        <Badge status="processing" text={dataViewDetail?.category} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Quantity">{dataViewDetail?.quantity}</Descriptions.Item>
                    <Descriptions.Item label="Sold">{dataViewDetail?.sold}</Descriptions.Item>
                    <Descriptions.Item label="CreateAt">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thumbnail">
                        <Avatar src={`${dataViewDetail?.thumbnail}`} size={100}>
                            {dataViewDetail?.thumbnail}
                        </Avatar>
                    </Descriptions.Item>
                </Descriptions>
                <Divider orientation="left">Slide images</Divider>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px', // Khoảng cách giữa các ảnh
                    }}
                >
                    {dataViewDetail?.slider.map((item, index) => {
                        return (
                            <Image key={index} src={`${item}`} width={150} height={150}>
                                {item}
                            </Image>
                        );
                    })}
                </div>
            </Drawer>
        </>
    );
};
export default DetailBook;
