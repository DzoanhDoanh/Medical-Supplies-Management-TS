import { useEffect, useState } from 'react';
import { App, Col, Divider, Form, Modal, Row, Select } from 'antd';
import type { FormProps } from 'antd';
import { addUsersToStorageApi, getStorageApi, getUsersApi, updateUserStorage } from '@/services/api';

interface IProps {
    openModalAddUsers: boolean;
    setOpenModalAddUsers: (v: boolean) => void;
    refreshTable: () => void;
    setDataAddUsers: (v: IStorage | null) => void;
    dataAddUsers: IStorage | null;
}

type FieldType = {
    manager: string[];
};

const AddUsers = (props: IProps) => {
    const { openModalAddUsers, setOpenModalAddUsers, refreshTable, setDataAddUsers, dataAddUsers } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [users, setUsers] = useState<IUser[]>([]);
    const { message, notification } = App.useApp();

    const [form] = Form.useForm();
    useEffect(() => {
        const fetchData = async () => {
            const fetchUser = await getUsersApi('');
            if (fetchUser && fetchUser.data) {
                setUsers(fetchUser.data);
            }
        };
        fetchData();
        if (dataAddUsers) {
            form.setFieldsValue({
                manager: dataAddUsers ? dataAddUsers.manager.map((item) => item.userId) : [],
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataAddUsers]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        const data: ManageStorage[] = values.manager.map((item) => {
            const currentUser = users.find((e) => e.id === item);
            return {
                userId: currentUser?.id ?? '',
                userName: currentUser?.fullName ?? '',
            };
        });
        const res = await addUsersToStorageApi(dataAddUsers?.id ?? '', data ?? []);
        const storages = (await getStorageApi('')).data ?? [];
        const result: userStorageMap[] = users
            .map((user) => {
                const storageIds = storages
                    .filter((storage) => storage.manager.some((manager) => manager.userId === user.id))
                    .map((storage) => storage.id);

                return {
                    userId: user.id,
                    storageIds,
                };
            })
            .filter((entry) => entry.storageIds.length > 0);
        await updateUserStorage('dvd', result);
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
                message.success('Thao tác thành công');
                form.resetFields();
                setOpenModalAddUsers(false);
                setIsSubmit(false);
                refreshTable();
            }
        }, 2000);
    };
    return (
        <>
            <Modal
                maskClosable={false}
                title="Cập nhật cán bộ phụ trách"
                open={openModalAddUsers}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalAddUsers(false);
                    setDataAddUsers(null);
                    form.resetFields();
                }}
                width={600}
                okText={'Xác nhận'}
                cancelText={'Hủy'}
                confirmLoading={isSubmit}
            >
                <Divider />
                <Form form={form} name="basic" onFinish={onFinish} autoComplete="off">
                    <Row gutter={[16, 16]}>
                        <Col span={24} md={24} xs={24}>
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Chọn cán bộ phụ trách"
                                name="manager"
                                rules={[{ required: true, message: 'Vui lòng chọn cán bộ phụ trách' }]}
                            >
                                <Select
                                    mode="multiple"
                                    style={{ width: '100%' }}
                                    placeholder="Hãy chọn cán bộ phụ trách"
                                    options={
                                        users &&
                                        users.map((item) => {
                                            return {
                                                label: item.fullName,
                                                value: item.id,
                                            };
                                        })
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};
export default AddUsers;
