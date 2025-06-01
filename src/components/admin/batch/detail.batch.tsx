import { FORMAT_DATE_VN } from '@/services/helper';
import { Descriptions, Drawer } from 'antd';
import dayjs from 'dayjs';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IBatch | null;
    setDataViewDetail: (v: IBatch | null) => void;
}

const DetailBatch = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    return (
        <>
            <Drawer title="Thông tin chi tiết danh mục" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Chi tiết danh mục" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên đợt cấp">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                        {dayjs(dataViewDetail?.startDate).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">
                        {dayjs(dataViewDetail?.endDate).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailBatch;
