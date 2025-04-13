import { getStorageByIdApi, getUserByIdApi } from '@/services/api';
import { FORMAT_DATE_VN } from '@/services/helper';
import { Badge, Descriptions, Divider, Drawer } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IMaterialRequest | null;
    setDataViewDetail: (v: IMaterialRequest | null) => void;
}

const DetailMaterialRequest = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const [user, setUsers] = useState<IUser>();
    const [depart, setDepart] = useState<IStorage>();

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    useEffect(() => {
        const fetchData = async () => {
            const res = await getUserByIdApi(dataViewDetail?.requesterInfo.requesterName ?? '');
            const storage = await getStorageByIdApi(dataViewDetail?.requesterInfo.departmentId ?? '');
            if (res && res.data) {
                setUsers(res.data);
            }
            if (storage && storage.data) {
                setDepart(storage.data);
            }
        };
        fetchData();
    }, [dataViewDetail]);
    return (
        <>
            <Drawer title="Thông tin chi tiết phiếu yêu cầu" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Chi tiết phiếu yêu cầu" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên đơn yêu cầu">{dataViewDetail?.requestName}</Descriptions.Item>
                    <Descriptions.Item label="Tên người yêu cầu">{user?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Tên kho nhận">{depart?.name}</Descriptions.Item>
                    <Descriptions.Item label="Đợt cấp">{dataViewDetail?.batch}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {dataViewDetail && dataViewDetail.status === 0 ? (
                            <Badge status="default" text="Đang chờ" />
                        ) : dataViewDetail && dataViewDetail!.status === 1 ? (
                            <Badge status="success" text="Đã duyệt" />
                        ) : dataViewDetail && dataViewDetail!.status === 2 ? (
                            <Badge status="error" text="Từ chối" />
                        ) : (
                            <Badge status="warning" text="Đã bàn giao" />
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mức độ ưu tiên">
                        {dataViewDetail && dataViewDetail.requesterInfo.type === '0' ? (
                            <Badge status="error" text="Cao" />
                        ) : dataViewDetail && dataViewDetail.requesterInfo.type === '1' ? (
                            <Badge status="warning" text="Trung bình" />
                        ) : dataViewDetail && dataViewDetail.requesterInfo.type === '2' ? (
                            <Badge status="success" text="Thấp" />
                        ) : (
                            <Badge status="default" text="Không có trạng thái" />
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                        {dayjs(dataViewDetail?.updateAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                </Descriptions>
                <Divider>Thông tin chi tiết vật tư yêu cầu</Divider>
                <Descriptions bordered column={3}>
                    {dataViewDetail?.materialRequests.map((item) => {
                        return (
                            <>
                                <Descriptions.Item label="Tên vật tư">{item?.materialName}</Descriptions.Item>
                                <Descriptions.Item label="Số lượng yêu cầu">{item?.quantity}</Descriptions.Item>
                                <Descriptions.Item label="Số lượng bàn giao">
                                    {item?.deliveredQuantity}
                                </Descriptions.Item>
                            </>
                        );
                    })}
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailMaterialRequest;
