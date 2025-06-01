/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { App, Col, DatePicker, Divider, Form, Input, Modal, Row, Select } from 'antd';
import type { FormProps } from 'antd';
import { updateBatchApi } from '@/services/api';
import dayjs from 'dayjs';

interface IProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IBatch | null) => void;
    dataUpdate: IBatch | null;
}

type FieldType = {
    name: string;
    startDate: string;
    endDate: string;
};
const { Option } = Select;
const UpdateBatch = (props: IProps) => {
    const { openModalUpdate, setOpenModalUpdate, refreshTable, setDataUpdate, dataUpdate } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                id: dataUpdate.id,
                name: dataUpdate.name,
                startDate: dayjs(dataUpdate.startDate),
                endDate: dayjs(dataUpdate.endDate),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdate]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        const res = await updateBatchApi(
            dataUpdate?.id ?? '',
            values.name,
            values.startDate,
            values.endDate,
            dataUpdate?.createAt ?? '',
        );
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Has an error!',
                    description: alertMessage,
                });
                setIsSubmit(false);
                return;
            } else {
                message.success('Cập nhật thông tin đợt cấp thành công');
                form.resetFields();
                setOpenModalUpdate(false);
                setIsSubmit(false);
                refreshTable();
            }
        }, 2000);
    };

    return (
        <>
            <Modal
                title="Cập nhật thông tin đợt cấp"
                open={openModalUpdate}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                    form.resetFields();
                }}
                width={600}
                okText={'Cập nhật'}
                cancelText={'Hủy'}
                confirmLoading={isSubmit}
            >
                <Divider />
                <Form form={form} name="basic" onFinish={onFinish} autoComplete="off">
                    <Row gutter={[16, 16]}>
                        <Col span={24} md={24} xs={24}>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Tên đợt cấp"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng điền tên đợt cấp' }]}
                            >
                                <Input placeholder="Vui lòng điền tên đợt cấp" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={12} md={12} xs={12}>
                            <Form.Item<FieldType>
                                label="Ngày bắt đầu"
                                name="startDate"
                                rules={[{ required: true, message: 'Không được để trống' }]}
                            >
                                <DatePicker placeholder="Nhập ngày bắt đầu" />
                            </Form.Item>
                        </Col>
                        <Col span={12} md={12} xs={12}>
                            <Form.Item<FieldType>
                                label="Ngày kết thúc"
                                name="endDate"
                                rules={[{ required: true, message: 'Không được để trống' }]}
                            >
                                <DatePicker placeholder="Nhập ngày kết thúc" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};
export default UpdateBatch;
