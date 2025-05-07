import { useCurrentApp } from '@/components/context/app.context';
import { getDepartmentByIdApi, getStorageByIdApi } from '@/services/api';
import { FORMAT_DATE_VN } from '@/services/helper';
import { Badge, Card, Checkbox, Descriptions, Divider } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const StorageDetail = () => {
    const { user } = useCurrentApp();
    const [dataViewDetail, setDataViewDetail] = useState<IStorage>();
    const [depart, setDepart] = useState<IDepartment>();
    useEffect(() => {
        const fetchData = async () => {
            const fetchDepart = await getDepartmentByIdApi(user?.departIdentity ?? '');
            if (fetchDepart && fetchDepart.data) {
                const res = await getStorageByIdApi(fetchDepart.data.storageId);
                if (res && res.data) {
                    setDataViewDetail(res.data);
                    setDepart(fetchDepart.data);
                }
            }
        };
        fetchData();
    }, [user]);
    return (
        <Card title="Thông tin chi tiết kho quản lý">
            <Descriptions title="Chi tiết" bordered column={2}>
                <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                <Descriptions.Item label="Tên kho">{dataViewDetail?.name}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{dataViewDetail?.desc}</Descriptions.Item>
                <Descriptions.Item label="Đơn vị trực thuộc">{depart?.name}</Descriptions.Item>
                <Descriptions.Item label="Là kho tổng">
                    <Checkbox checked={dataViewDetail?.mainStorage} />
                </Descriptions.Item>
                <Descriptions.Item label="Cán bộ phụ trách">
                    {dataViewDetail?.manager.map((item) => {
                        return (
                            <Badge
                                key={item.userId}
                                text={item.userName}
                                style={{ marginRight: '8px' }}
                                status="success"
                            ></Badge>
                        );
                    })}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">
                    {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                </Descriptions.Item>
            </Descriptions>
            <Divider>Thông tin chi tiết vật tư có trong kho</Divider>
            <Descriptions bordered column={2}>
                {dataViewDetail?.materials.map((item) => {
                    return (
                        <>
                            <Descriptions.Item label="Tên vật tư">{item?.materialName}</Descriptions.Item>
                            <Descriptions.Item label="Số lượng">{item?.quantity}</Descriptions.Item>
                        </>
                    );
                })}
            </Descriptions>
        </Card>
    );
};
export default StorageDetail;
