import { FORMAT_DATE_VN } from '@/services/helper';
import { Descriptions, Divider, Drawer } from 'antd';
import dayjs from 'dayjs';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IHandOver | null;
    setDataViewDetail: (v: IHandOver | null) => void;
}

const DetailHandOver = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    return (
        <>
            <Drawer title="Thông tin chi tiết phiếu nhập" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Chi tiết phiếu nhập" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên người bàn giao">
                        {dataViewDetail?.senderInfo.userName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên người nhận">
                        {dataViewDetail?.receiverInfo.userName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đợt">{dataViewDetail?.batch}</Descriptions.Item>
                    <Descriptions.Item label="Ngày bàn giao">
                        {dayjs(dataViewDetail?.sendDate).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày nhận">
                        {dayjs(dataViewDetail?.receiveDate).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                </Descriptions>
                <Divider>Thông tin chi tiết vật tư bàn giao</Divider>
                <Descriptions bordered column={3}>
                    {dataViewDetail?.materials.map((item) => {
                        return (
                            <>
                                <Descriptions.Item label="Tên vật tư">{item?.materialName}</Descriptions.Item>
                                <Descriptions.Item label="Số lượng bàn giao">{item?.quantity}</Descriptions.Item>
                            </>
                        );
                    })}
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailHandOver;
