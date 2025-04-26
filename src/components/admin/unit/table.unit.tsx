/* eslint-disable @typescript-eslint/no-unused-vars */
import { deleteUnitApi, getUnitWidthQueryApi } from '@/services/api';
// import { dateRangeValidate } from '@/services/helper';
import { DeleteTwoTone, EditTwoTone, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import DetailUnit from './detail.unit';
import CreateUnit from './create.unit';
import UpdateUnit from './update.unit';

type TSearch = {
    name: string;
};
const TableUnit = () => {
    const actionRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IUnit | null>(null);
    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
    const [currentDataTable, setCurrentDataTable] = useState<IUnit[]>([]);
    const [excelData, setExcelData] = useState([]);
    const [dataUpdate, setDataUpdate] = useState<IUnit | null>(null);
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [isDeleteUnit, setIsDeleteUnit] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    const handleDeleteUnit = async (id: string) => {
        const res = await deleteUnitApi(id);
        setTimeout(() => {
            if (res && res.data && typeof res.data === 'string') {
                const alertMessage = res.data + '';
                notification.error({
                    message: 'Has an error!',
                    description: alertMessage,
                });
                setIsDeleteUnit(true);
                return;
            } else {
                message.success('Xóa thành công!');
                setIsDeleteUnit(false);
                refreshTable();
            }
        }, 500);
    };
    const columns: ProColumns<IUnit>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'ID',
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
            title: 'Đơn vị tính',
            dataIndex: 'name',
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
                            title={'Xóa đơn vị tính'}
                            description="Bạn có chắc là xóa đơn vị tính này"
                            onConfirm={() => handleDeleteUnit(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ loading: isDeleteUnit }}
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
            <ProTable<IUnit, TSearch>
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
                    const allData = await getUnitWidthQueryApi(query);
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
                    pageSize: 7,
                    onChange: (page) => console.log(page),
                }}
                headerTitle="Quản lý đơn vị tính"
                toolBarRender={() => [
                    <Button icon={<ExportOutlined />} type="primary">
                        <CSVLink data={excelData} filename="export-unit.csv">
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
            <DetailUnit
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
            <CreateUnit
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                refreshTable={refreshTable}
            />
            <UpdateUnit
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                refreshTable={refreshTable}
                setDataUpdate={setDataUpdate}
                dataUpdate={dataUpdate}
            />
        </>
    );
};

export default TableUnit;
