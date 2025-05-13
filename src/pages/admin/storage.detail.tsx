import { useCurrentApp } from '@/components/context/app.context';
import { getDepartmentByIdApi, getStorageApi, getStorageByIdApi, getUserStorage } from '@/services/api';
import { FORMAT_DATE_VN } from '@/services/helper';
import { Badge, Card, Checkbox, Descriptions, Divider, Select, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const Title = Typography;
const StorageDetail = () => {
    const { user } = useCurrentApp();
    const [dataViewDetail, setDataViewDetail] = useState<IStorage>();
    const [depart, setDepart] = useState<IDepartment>();
    const [userStorage, setUserStorage] = useState<IUSER_STORAGE[]>();
    const [storages, setStorages] = useState<IStorage[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const fetchStorage = await getStorageApi('');
            if (fetchStorage && fetchStorage.data) {
                setStorages(fetchStorage.data);
            }

            const fetchUserStorage = await getUserStorage('');
            if (fetchUserStorage && fetchUserStorage.data) {
                setUserStorage(fetchUserStorage.data);
            }
        };
        fetchData();
    }, [user]);
    const handleStorageChange = async (value: string) => {
        const fetchStore = await getStorageByIdApi(value);
        const fetchDepart = await getDepartmentByIdApi(fetchStore.data?.departmentId ?? '');
        if (fetchStore && fetchStore.data) {
            setDepart(fetchDepart.data);
            setDataViewDetail(fetchStore.data);
        }
    };
    return (
        <Card title="Thông tin chi tiết kho quản lý">
            <Title style={{ marginBottom: '12px' }}>Chọn kho được phân công quản lý</Title>
            <Select
                style={{ marginBottom: '12px' }}
                placeholder="Chọn kho được phân công quản lý"
                onChange={handleStorageChange}
            >
                {user &&
                    userStorage &&
                    userStorage[0].result
                        .find((e) => e.userId === user.id)
                        ?.storageIds.map((storageId) => {
                            return (
                                <Select.Option key={storageId} value={storageId}>
                                    {storages.find((e) => e.id === storageId)?.name}
                                </Select.Option>
                            );
                        })}
            </Select>
            {dataViewDetail ? (
                <>
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
                </>
            ) : (
                <></>
            )}
        </Card>
    );
};
export default StorageDetail;
