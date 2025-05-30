import { FORMAT_DATE_VN } from '@/services/helper';
import { Descriptions, Divider, Drawer } from 'antd';
import dayjs from 'dayjs';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IImportRequest | null;
    setDataViewDetail: (v: IImportRequest | null) => void;
}

const DetailMaterialImport = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    return (
        <>
            <Drawer title="Thông tin chi tiết phiếu nhập" width={'70vw'} onClose={onClose} open={openViewDetail}>
                <Descriptions title="Chi tiết phiếu nhập" bordered column={2}>
                    <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên phiếu nhập">{dataViewDetail?.requestName}</Descriptions.Item>
                    <Descriptions.Item label="Tên người nhập">{dataViewDetail?.senderInfo?.userName}</Descriptions.Item>
                    <Descriptions.Item label="Đợt nhập">{dataViewDetail?.receiverInfo?.userName}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(dataViewDetail?.createAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                        {dayjs(dataViewDetail?.updateAt).format(FORMAT_DATE_VN)}
                    </Descriptions.Item>
                </Descriptions>
                <Divider>Thông tin chi tiết vật tư</Divider>
                <Descriptions bordered column={3}>
                    {dataViewDetail?.materialRequests.map((item) => {
                        return (
                            <>
                                <Descriptions.Item label="Tên vật tư">{item?.materialName}</Descriptions.Item>
                                <Descriptions.Item label="Số lượng yêu cầu">{item?.quantity}</Descriptions.Item>
                                <Descriptions.Item label="Số lượng đã nhập">
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
export default DetailMaterialImport;
