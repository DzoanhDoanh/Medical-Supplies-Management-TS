/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStorageApi, getDepartmentsApi } from '@/services/api';
import { App, Divider, Form, Modal, Input, Select, Row, Col, Checkbox } from 'antd';
import type { FormProps } from 'antd';
import { useEffect, useState } from 'react';

interface IProps {
    openModalCreate: boolean;
    setOpenModalCreate: (v: boolean) => void;
    refreshTable: () => void;
}
type FieldType = {
    name: string;
    departmentId: string;
    mainStorage: boolean;
    desc: string;
};
const { Option } = Select;
const CreateStorage = (props: IProps) => {
    const { openModalCreate, setOpenModalCreate, refreshTable } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { message, notification } = App.useApp();
    const [departments, setDepartments] = useState<IDepartment[]>([]);

    const [form] = Form.useForm();
    useEffect(() => {
        const fetchData = async () => {
            const fetchDepart = await getDepartmentsApi('');
            if (fetchDepart && fetchDepart.data) {
                setDepartments(fetchDepart.data);
            }
        };
        fetchData();
    }, []);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        const res = await createStorageApi(
            values.name,
            values.departmentId,
            values.mainStorage ? true : false,
            values.desc,
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
                message.success('Tạo mới thành công!');
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
                title="Thêm mới kho"
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
                                label="Tên kho"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng điền tên phòng ban' }]}
                            >
                                <Input placeholder="Vui lòng điền tên phòng ban" />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Đơn vị trực thuộc"
                                name="departmentId"
                                rules={[{ required: true, message: 'Vui lòng điền đơn vị trực thuộc' }]}
                            >
                                <Select placeholder="Hãy chọn đơn vị trực thuộc" allowClear>
                                    {departments &&
                                        departments.map((item) => {
                                            return (
                                                <Option key={item.id} value={item.id}>
                                                    {item.name}
                                                </Option>
                                            );
                                        })}
                                </Select>
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Là kho tổng"
                                name="mainStorage"
                                valuePropName="checked"
                            >
                                <Checkbox />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Mô tả"
                                name="desc"
                                rules={[{ required: true, message: 'Vui lòng điền mô tả' }]}
                            >
                                <Input placeholder="Vui lòng điền mô tả" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};
export default CreateStorage;
