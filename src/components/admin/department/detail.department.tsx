import { FORMAT_DATE_VN } from '@/services/helper';
import { Descriptions, Drawer } from 'antd';
import dayjs from 'dayjs';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IDepartment | null;
    setDataViewDetail: (v: IDepartment | null) => void;
}

const DetailDepartment = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    return (
        <>
            <Drawer title="Thông tin chi tiết phòng ban" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Chi tiết phòng ban" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên phòng ban">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Đơn vị trực thuộc">{dataViewDetail?.affiliatedUnit}</Descriptions.Item>
                    <Descriptions.Item label="Người phụ trách">{dataViewDetail?.userName}</Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailDepartment;
