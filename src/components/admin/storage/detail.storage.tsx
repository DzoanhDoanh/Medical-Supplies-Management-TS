import { getDepartmentsApi } from '@/services/api';
import { FORMAT_DATE_VN } from '@/services/helper';
import { Badge, Checkbox, Descriptions, Divider, Drawer } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IStorage | null;
    setDataViewDetail: (v: IStorage | null) => void;
}

const DetailStorage = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const [depart, setDepart] = useState<IDepartment[]>([]);

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    useEffect(() => {
        const fetchData = async () => {
            const res = await getDepartmentsApi('');
            if (res && res.data) {
                setDepart(res.data);
            }
        };
        fetchData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataViewDetail]);
    return (
        <>
            <Drawer title="Thông tin chi tiết" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Chi tiết" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên kho">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{dataViewDetail?.desc}</Descriptions.Item>
                    <Descriptions.Item label="Đơn vị quản lý trực tiếp">
                        {depart.find((e) => e.id === dataViewDetail?.departmentId)?.name}
                    </Descriptions.Item>
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
            </Drawer>
        </>
    );
};
export default DetailStorage;
