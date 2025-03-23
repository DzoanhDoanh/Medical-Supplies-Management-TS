import { FORMAT_DATE_VN } from '@/services/helper';
import { Avatar, Badge, Descriptions, Drawer } from 'antd';
import dayjs from 'dayjs';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IUser | null;
    setDataViewDetail: (v: IUser | null) => void;
}

const DetailUser = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };

    return (
        <>
            <Drawer title="View Detail" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="User information" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Fullname">{dataViewDetail?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{dataViewDetail?.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{dataViewDetail?.phone}</Descriptions.Item>
                    <Descriptions.Item label="Role">
                        <Badge status="processing" text={dataViewDetail?.role} />
                    </Descriptions.Item>
                    <Descriptions.Item label="CreateAt">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Avatar">
                        <Avatar src={`http://localhost:5173/src/assets/images/${dataViewDetail?.avatar}`} size={100}>
                            {dataViewDetail?.avatar}
                        </Avatar>
                    </Descriptions.Item>
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailUser;
