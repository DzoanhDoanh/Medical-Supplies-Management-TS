/* eslint-disable @typescript-eslint/no-unused-vars */
import { deleteDepartmentApi, getDepartmentsApi, getStorageApi } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { CloudUploadOutlined, DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ImportUser from './data/import.department';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import DetailDepartment from './detail.department';
import CreateDepartment from './create.department';
import UpdateDepartment from './update.department';

type TSearch = {
    name: string;
    userId: string;
    createAt: string;
    createAtRange: string;
};
const TableDepartment = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IDepartment | null>(null);
    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
    const [openModalImport, setOpenModalImport] = useState<boolean>(false);
    const [currentDataTable, setCurrentDataTable] = useState<IDepartment[]>([]);
    const [excelData, setExcelData] = useState([]);
    const [dataUpdate, setDataUpdate] = useState<IDepartment | null>(null);
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [isDeleteDepartment, setIsDeleteDepartment] = useState<boolean>(false);
    const [storages, setStorages] = useState<IStorage[]>([]);
    const { message, notification } = App.useApp();

    const handleDeleteDepartment = async (id: string) => {
        const res = await deleteDepartmentApi(id);
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Has an error!',
                    description: alertMessage,
                });
                setIsDeleteDepartment(true);
                return;
            } else {
                message.success('Xóa phòng ban thành công!');
                setIsDeleteDepartment(false);
                refreshTable();
            }
        }, 500);
    };
    useEffect(() => {
        const fetchData = async () => {
            const res = await getStorageApi('');
            if (res && res.data) {
                setStorages(res.data);
            }
        };
        fetchData();
    }, []);
    const columns: ProColumns<IDepartment>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Mã phòng ban',
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
            title: 'Tên phòng',
            dataIndex: 'name',
        },
        {
            title: 'Tên người phụ trách',
            dataIndex: 'userName',
            hideInSearch: true,
            render(dom, entity) {
                return <span>{entity.userName}</span>;
            },
        },
        {
            title: 'Đơn vị trực thuộc',
            dataIndex: 'affiliatedUnit',
            hideInSearch: true,
            render(dom, entity) {
                return <span>{entity.affiliatedUnit}</span>;
            },
        },
        {
            title: 'Kho quản lý',
            dataIndex: 'storageId',
            hideInSearch: true,
            render(dom, entity) {
                try {
                    const result = storages.find((e) => e.id === entity.storageId);
                    return <span>{result?.name}</span>;
                } catch (error) {
                    return <span>Trống</span>;
                }
            },
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
                            title={'Xóa phòng ban'}
                            description="Bạn có chắc là xóa phòng ban này"
                            onConfirm={() => handleDeleteDepartment(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ loading: isDeleteDepartment }}
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
            <ProTable<IDepartment, TSearch>
                columns={columns}
                scroll={{ x: 1000 }}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);

                    let query = '';
                    if (params) {
                        if (params.name) {
                            query += `&name_like=${params.name}`;
                        }
                    }

                    if (sort && sort.id) {
                        const sortBy = sort.id === 'ascend' ? 'asc' : 'desc';
                        query += `&_sort=id&_order=${sortBy}`;
                    }
                    const allDepartments = await getDepartmentsApi(query);
                    if (allDepartments && typeof allDepartments.data !== 'string') {
                        setCurrentDataTable(allDepartments.data ?? []);
                        if (allDepartments.data) {
                            const data = allDepartments.data;
                            const result = data.map((item) => {
                                return {
                                    id: item.id,
                                    name: item.name,
                                    affiliatedUnit: item.affiliatedUnit,
                                    userId: item.userId,
                                    createAt: item.createAt,
                                };
                            });
                            setExcelData(result as []);
                        }
                    }
                    return {
                        data: allDepartments.data,
                        page: 1,
                        success: true,
                        // total: 3,
                    };
                }}
                rowKey="id"
                pagination={{
                    pageSize: 5,
                    onChange: (page) => console.log(page),
                }}
                headerTitle="Quản lý phòng ban"
                toolBarRender={() => [
                    <Button icon={<ExportOutlined />} type="primary">
                        <CSVLink data={excelData} filename="export-department.csv">
                            Tải excel
                        </CSVLink>
                    </Button>,
                    <Button
                        icon={<CloudUploadOutlined />}
                        type="primary"
                        onClick={() => {
                            setOpenModalImport(true);
                        }}
                    >
                        Import Department
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
            <DetailDepartment
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
            <CreateDepartment
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                refreshTable={refreshTable}
            />
            <ImportUser openModalImport={openModalImport} setOpenModalImport={setOpenModalImport} />
            <UpdateDepartment
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                refreshTable={refreshTable}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
        </>
    );
};

export default TableDepartment;
