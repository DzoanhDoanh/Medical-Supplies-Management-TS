import { useEffect, useState } from 'react';
import { App, Checkbox, Col, Divider, Form, Input, Modal, Row, Select } from 'antd';
import type { FormProps } from 'antd';
import { getDepartmentsApi, updateStorageApi } from '@/services/api';

interface IProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IStorage | null) => void;
    dataUpdate: IStorage | null;
}

type FieldType = {
    name: string;
    departmentId: string;
    mainStorage: boolean;
    desc: string;
};
const { Option } = Select;
const UpdateStorage = (props: IProps) => {
    const { openModalUpdate, setOpenModalUpdate, refreshTable, setDataUpdate, dataUpdate } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [departments, setDepartments] = useState<IDepartment[]>([]);
    const { message, notification } = App.useApp();

    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            const fetchDepart = await getDepartmentsApi('');
            if (fetchDepart && fetchDepart.data) {
                setDepartments(fetchDepart.data);
            }
        };
        fetchData();
        if (dataUpdate) {
            form.setFieldsValue({
                id: dataUpdate.id,
                name: dataUpdate.name,
                departmentId: dataUpdate.departmentId,
                mainStorage: dataUpdate.mainStorage,
                desc: dataUpdate.desc,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdate]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        const res = await updateStorageApi(
            dataUpdate?.id ?? '',
            values.name,
            dataUpdate?.materials ?? [],
            dataUpdate?.manager ?? [],
            values.departmentId,
            values.mainStorage ? true : false,
            values.desc,
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
                message.success('Thao tác thành công!');
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
                title="Cập nhật thông tin phòng ban"
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
                                label="Tên kho"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng điền tên phòng ban' }]}
                            >
                                <Input placeholder="Vui lòng điền tên phòng ban" />
                            </Form.Item>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Đơn vị quản lý trực tiếp"
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
export default UpdateStorage;
