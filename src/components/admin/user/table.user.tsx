/* eslint-disable @typescript-eslint/no-unused-vars */
import { deleteUserApi, getUsersApi } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { CloudUploadOutlined, DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import DetailUser from './detail.user';
import CreateUser from './create.user';
import ImportUser from './data/import.user';
import { CSVLink } from 'react-csv';
import UpdateUser from './update.user';
import dayjs from 'dayjs';

type TSearch = {
    fullName: string;
    email: string;
    createAt: string;
    createAtRange: string;
};
const TableUser = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IUser | null>(null);
    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
    const [openModalImport, setOpenModalImport] = useState<boolean>(false);
    const [currentDataTable, setCurrentDataTable] = useState<IUser[]>([]);
    const [excelData, setExcelData] = useState([]);
    const [dataUpdate, setDataUpdate] = useState<IUser | null>(null);
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [isDeleteUser, setIsDeleteUser] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    const handleDeleteUser = async (id: string) => {
        // setIsDeleteUser(false);
        const res = await deleteUserApi(id);
        console.log(res);
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Has an error!',
                    description: alertMessage,
                });
                setIsDeleteUser(true);
                return;
            } else {
                message.success('Xóa nhân viên thành công!');
                setIsDeleteUser(false);
                refreshTable();
            }
        }, 500);
    };
    const columns: ProColumns<IUser>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Mã nhân viên',
            dataIndex: 'id',
            hideInSearch: true,
            sorter: true,
            render(dom, entity) {
                return (
                    <a
                        onClick={() => {
                            setDataViewDetail(entity);
                            setOpenViewDetail(true);
                        }}
                        href="#"
                    >
                        {entity.id}
                    </a>
                );
            },
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            copyable: true,
        },
        {
            title: 'Chức vụ',
            dataIndex: 'position',
            hideInSearch: true,
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            hideInSearch: true,
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            hideInSearch: true,
        },
        {
            title: 'Tạo ngày',
            dataIndex: 'createAt',
            valueType: 'date',
            hideInSearch: true,
            render(dom, entity) {
                return <>{dayjs(entity.createAt).format('DD-MM-YYYY')}</>;
            },
        },
        {
            title: 'Create At',
            dataIndex: 'createAtRange',
            valueType: 'dateRange',
            sorter: true,
            hideInTable: true,
            hideInSearch: true,
        },
        {
            title: 'Hành động',
            hideInSearch: true,
            render(dom, entity) {
                return (
                    <>
                        <EditTwoTone
                            twoToneColor={'#f57800'}
                            style={{ cursor: 'pointer', marginRight: 15 }}
                            onClick={() => {
                                setDataUpdate(entity);
                                setOpenModalUpdate(true);
                            }}
                        />
                        <Popconfirm
                            placement="leftTop"
                            title={'Xóa nhân viên'}
                            description="Bạn có chắc là xóa nhân viên này"
                            onConfirm={() => handleDeleteUser(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ loading: isDeleteUser }}
                        >
                            <span style={{ cursor: 'pointer', marginLeft: '20px' }}>
                                <DeleteTwoTone twoToneColor={'#ff4d4f'} style={{ cursor: 'pointer' }} />
                            </span>
                        </Popconfirm>
                    </>
                );
            },
        },
    ];

    const refreshTable = () => {
        actionRef.current?.reload();
    };
    return (
        <>
            <ProTable<IUser, TSearch>
                columns={columns}
                scroll={{ x: 1000 }}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);

                    let query = '';
                    if (params) {
                        if (params.email) {
                            query += `&email_like=${params.email}`;
                        }
                        if (params.fullName) {
                            query += `&fullName_like=${params.fullName}`;
                        }
                        // const createDateRange = dateRangeValidate(params.createAtRange);
                        // if (createDateRange) {
                        //     query += `&createAt>=${createDateRange[0]}&createAt<=${createDateRange[1]}`;
                        // }
                    }

                    if (sort && sort.id) {
                        const sortBy = sort.id === 'ascend' ? 'asc' : 'desc';
                        query += `&_sort=id&_order=${sortBy}`;
                    }
                    const allUser = await getUsersApi(query);
                    if (allUser && typeof allUser.data !== 'string') {
                        setCurrentDataTable(allUser.data ?? []);
                        if (allUser.data) {
                            const data = allUser.data;
                            const result = data.map((item) => {
                                return {
                                    id: item.id,
                                    fullName: item.fullName,
                                    email: item.email,
                                    phone: item.phone,
                                    departIdentity: item.departIdentity,
                                    position: item.position,
                                    gender: item.gender,
                                    dateOfBirth: item.dateOfBirth,
                                    address: item.address,
                                };
                            });
                            setExcelData(result as []);
                        }
                    }
                    return {
                        data: allUser.data,
                        page: 1,
                        success: true,
                        // total: 3,
                    };
                }}
                rowKey="id"
                pagination={{
                    pageSize: 7,
                    onChange: (page) => console.log(page),
                }}
                headerTitle="Quản lý nhân viên"
                toolBarRender={() => [
                    <Button icon={<ExportOutlined />} type="primary">
                        <CSVLink data={excelData} filename="export-user.csv">
                            Tải excel
                        </CSVLink>
                    </Button>,
                    <Button
                        icon={<CloudUploadOutlined />}
                        type="primary"
                        onClick={() => {
                            // setOpenModalImport(true);
                            message.warning('Chức năng đang phát triển');
                        }}
                    >
                        Import nhân viên
                    </Button>,
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setOpenModalCreate(true);
                        }}
                        type="primary"
                    >
                        Thêm mới
                    </Button>,
                ]}
            />
            <DetailUser
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
            <CreateUser
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                refreshTable={refreshTable}
            />
            <ImportUser openModalImport={openModalImport} setOpenModalImport={setOpenModalImport} />
            <UpdateUser
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                refreshTable={refreshTable}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
        </>
    );
};

export default TableUser;
