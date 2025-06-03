/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { App, Col, Divider, Form, Input, Modal, Row, Select } from 'antd';
import type { FormProps } from 'antd';
import { updateCategoryApi } from '@/services/api';

interface IProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: ICategory | null) => void;
    dataUpdate: ICategory | null;
}

type FieldType = {
    categoryName: string;
};
const { Option } = Select;
const UpdateCategory = (props: IProps) => {
    const { openModalUpdate, setOpenModalUpdate, refreshTable, setDataUpdate, dataUpdate } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                id: dataUpdate.id,
                categoryName: dataUpdate.categoryName,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdate]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        const res = await updateCategoryApi(dataUpdate?.id ?? '', values.categoryName, dataUpdate?.createAt ?? '');
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Có lỗi xảy ra vui lòng thử lại!',
                    description: alertMessage,
                });
                setIsSubmit(false);
                return;
            } else {
                message.success('Cập nhật thông tin danh mục thành công');
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
                title="Cập nhật thông tin danh mục"
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
                                label="Tên danh mục"
                                name="categoryName"
                                rules={[{ required: true, message: 'Vui lòng điền tên danh mục' }]}
                            >
                                <Input placeholder="Vui lòng điền tên danh mục" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};
export default UpdateCategory;
