/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBatchApi } from '@/services/api';
import { App, Divider, Form, Modal, Input, Select, DatePicker, Upload, Row, Col } from 'antd';
import type { FormProps } from 'antd';
import { useEffect, useState } from 'react';
import { Rule } from 'antd/es/form';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
    openModalCreate: boolean;
    setOpenModalCreate: (v: boolean) => void;
    refreshTable: () => void;
}
type FieldType = {
    name: string;
    startDate: string;
    endDate: string;
};
const { Option } = Select;
const CreateBatch = (props: IProps) => {
    const { openModalCreate, setOpenModalCreate, refreshTable } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    const [form] = Form.useForm();

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);

        const res = await createBatchApi(values.name, values.startDate, values.endDate);
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
                message.success('Tạo mới đợt cấp thành công!');
                form.resetFields();
                setOpenModalCreate(false);
                setIsSubmit(false);
                refreshTable();
            }
        }, 2000);
    };
    return (
        <>
            <Modal
                title="Thêm mới đợt cấp"
                open={openModalCreate}
                width={600}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalCreate(false);
                    form.resetFields();
                }}
                okText={'Tạo mới'}
                cancelText="Hủy"
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
export default CreateBatch;
