import CurrencyFormatter from '@/components/currencyFormatter/currency.formatter';
import { FORMAT_DATE_VN } from '@/services/helper';
import { Avatar, Descriptions, Drawer } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { getCategoryApi } from '@/services/api';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: ISupplies | null;
    setDataViewDetail: (v: ISupplies | null) => void;
}

const DetailSupply = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const [categories, setCategories] = useState<ICategory[]>([]);
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    useEffect(() => {
        const fetchData = async () => {
            const res = await getCategoryApi();
            if (res && res.data) {
                setCategories(res.data);
            }
        };
        fetchData();
    }, []);
    return (
        <>
            <Drawer title="Xem chi tiết vật tư" width={'50vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Thông tin chi tiết vật tư" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên vật tư">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Danh mục">
                        {categories.find((e) => e.id === dataViewDetail?.categoryId)?.categoryName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{dataViewDetail?.desc}</Descriptions.Item>
                    <Descriptions.Item label="Đơn vị tính">{dataViewDetail?.unit}</Descriptions.Item>
                    <Descriptions.Item label="Xuất xứ">{dataViewDetail?.manufacturer}</Descriptions.Item>
                    {/* <Descriptions.Item label="Số lô">{dataViewDetail?.batchNumber}</Descriptions.Item> */}
                    {/* <Descriptions.Item label="Trạng thái">{dataViewDetail?.status}</Descriptions.Item> */}
                    {/* <Descriptions.Item label="Số lượng">{dataViewDetail?.quantity}</Descriptions.Item> */}
                    <Descriptions.Item label="Ngày hết hạn">
                        {dataViewDetail?.expirationDate === '2003-12-16T17:00:00.000Z'
                            ? 'Không có'
                            : dayjs(dataViewDetail?.expirationDate).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá nhập">
                        <CurrencyFormatter value={dataViewDetail?.costPrice || 0} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                        {dayjs(dataViewDetail?.updateAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    {dataViewDetail && dataViewDetail.thumbnail && dataViewDetail?.thumbnail?.length > 50 ? (
                        <Descriptions.Item label="Thumbnail">
                            <Avatar src={`${dataViewDetail?.thumbnail}`} size={100}>
                                {dataViewDetail?.thumbnail}
                            </Avatar>
                        </Descriptions.Item>
                    ) : (
                        <Descriptions.Item label="Thumbnail">
                            <Avatar
                                src={`http://localhost:5173/src/assets/images/${dataViewDetail?.thumbnail}`}
                                size={100}
                            >
                                {dataViewDetail?.thumbnail}
                            </Avatar>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Drawer>
        </>
    );
};
export default DetailSupply;
