/* eslint-disable @typescript-eslint/no-unused-vars */
import { deleteDepartmentApi, deleteStorageApi, getDepartmentsApi, getStorageApi } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { CloudUploadOutlined, DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Badge, Button, Checkbox, Col, Input, Popconfirm, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import DetailStorage from './detail.storage';
import CreateStorage from './create.storage';
import UpdateStorage from './update.storage';

type TSearch = {
    name: string;
    createAt: string;
    createAtRange: string;
};
const TableStorage = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IStorage | null>(null);
    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
    const [currentDataTable, setCurrentDataTable] = useState<IStorage[]>([]);
    const [excelData, setExcelData] = useState([]);
    const [dataUpdate, setDataUpdate] = useState<IStorage | null>(null);
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [isDeleteStorage, setIsDeleteStorage] = useState<boolean>(false);
    const [departments, setDepartments] = useState<IDepartment[]>([]);
    const { message, notification } = App.useApp();

    const handleDeleteDepartment = async (entity: IStorage) => {
        if (entity.materials.length > 0) {
            message.warning('Không thể xóa kho vì vẫn còn vật tư');
            return;
        }
        const res = await deleteStorageApi(entity.id);
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Has an error!',
                    description: alertMessage,
                });
                setIsDeleteStorage(true);
                return;
            } else {
                message.success('Xóa kho thành công!');
                setIsDeleteStorage(false);
                refreshTable();
            }
        }, 500);
    };
    useEffect(() => {
        const fetchData = async () => {
            const fetchDepart = await getDepartmentsApi('');
            if (fetchDepart && fetchDepart.data) {
                setDepartments(fetchDepart.data);
            }
        };
        fetchData();
    }, []);
    const columns: ProColumns<IStorage>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Mã kho',
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
            title: 'Tên kho',
            dataIndex: 'name',
        },
        {
            title: 'Tên cán bộ quản lý',
            hideInSearch: true,
            render(dom, entity) {
                return entity.manager.length !== 0
                    ? entity.manager.map((item, index) => {
                          return (
                              <Badge key={index} status="success" style={{ marginRight: '8px' }} text={item.userName} />
                          );
                      })
                    : 'Trống';
            },
        },
        {
            title: 'Đơn vị trực thuộc',
            dataIndex: 'departmentId',
            hideInSearch: true,
            render(dom, entity) {
                return <span>{departments.find((e) => e.id === entity.departmentId)?.name}</span>;
            },
        },
        {
            title: 'Là kho tổng',
            dataIndex: 'mainStorage',
            hideInSearch: true,
            render(dom, entity) {
                return <Checkbox disabled checked={entity.mainStorage}></Checkbox>;
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
                            title={'Xóa'}
                            description="Bạn có chắc là xóa?"
                            onConfirm={() => handleDeleteDepartment(entity)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ loading: isDeleteStorage }}
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
            <ProTable<IStorage, TSearch>
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
                    const allData = await getStorageApi(query);
                    if (allData && typeof allData.data !== 'string') {
                        setCurrentDataTable(allData.data ?? []);
                        if (allData.data) {
                            const data = allData.data;
                            const result = data.map((item) => {
                                return {
                                    id: item.id,
                                    name: item.name,
                                    createAt: item.createAt,
                                };
                            });
                            setExcelData(result as []);
                        }
                    }
                    return {
                        data: allData.data,
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
                headerTitle="Quản lý kho"
                toolBarRender={() => [
                    <Button icon={<ExportOutlined />} type="primary">
                        <CSVLink data={excelData} filename="export-department.csv">
                            Tải excel
                        </CSVLink>
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
            <DetailStorage
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
            <CreateStorage
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                refreshTable={refreshTable}
            />
            <UpdateStorage
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                refreshTable={refreshTable}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
        </>
    );
};

export default TableStorage;
