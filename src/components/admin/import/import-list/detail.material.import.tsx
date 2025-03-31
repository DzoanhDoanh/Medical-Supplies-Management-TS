import { getUserByIdApi } from '@/services/api';
import { FORMAT_DATE_VN } from '@/services/helper';
import { Descriptions, Divider, Drawer } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IImportRequest | null;
    setDataViewDetail: (v: IImportRequest | null) => void;
}

const DetailMaterialImport = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const [user, setUsers] = useState<IUser>();

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    useEffect(() => {
        const fetchData = async () => {
            const res = await getUserByIdApi(dataViewDetail?.requesterName ?? '');
            if (res && res.data) {
                setUsers(res.data);
            }
        };
        fetchData();
    }, [dataViewDetail]);
    return (
        <>
            <Drawer title="Thông tin chi tiết phiếu nhập" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Chi tiết phiếu nhập" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên phiếu nhập">{dataViewDetail?.requestName}</Descriptions.Item>
                    <Descriptions.Item label="Tên người thực hiện">{user?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                        {dayjs(dataViewDetail?.updateAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                </Descriptions>
                <Divider>Thông tin chi tiết vật tư đã nhập</Divider>
                <Descriptions bordered column={2}>
                    {dataViewDetail?.materialRequests.map((item) => {
                        return (
                            <>
                                <Descriptions.Item label="Tên vật tư">{item?.materialName}</Descriptions.Item>
                                <Descriptions.Item label="Số lượng">{item?.quantity}</Descriptions.Item>
                            </>
                        );
                    })}
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailMaterialImport;
