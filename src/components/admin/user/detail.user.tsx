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
    console.log(dataViewDetail?.avatar);
    return (
        <>
            <Drawer title="Thông tin chi tiết nhân viên" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="User information" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Họ tên">{dataViewDetail?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{dataViewDetail?.email}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{dataViewDetail?.phone}</Descriptions.Item>
                    <Descriptions.Item label="Vai trò">
                        <Badge status="processing" text={dataViewDetail?.role} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phòng ban">{dataViewDetail?.departmentId}</Descriptions.Item>
                    <Descriptions.Item label="Chức vụ">{dataViewDetail?.position}</Descriptions.Item>
                    <Descriptions.Item label="Giới tính">{dataViewDetail?.gender}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                        {dayjs(dataViewDetail?.dateOfBirth).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{dataViewDetail?.address}</Descriptions.Item>
                    {dataViewDetail && dataViewDetail?.avatar.length > 50 ? (
                        <Descriptions.Item label="Ảnh đại diện">
                            <Avatar src={dataViewDetail?.avatar} size={100}>
                                {dataViewDetail?.fullName}
                            </Avatar>
                        </Descriptions.Item>
                    ) : (
                        <Descriptions.Item label="Ảnh đại diện">
                            <Avatar src={`http://localhost:5173/src/assets/images/avatar.png`} size={100}>
                                {dataViewDetail?.avatar}
                            </Avatar>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailUser;
