import { InboxOutlined } from '@ant-design/icons';
import { App, Modal, Table, Upload } from 'antd';
import type { UploadProps } from 'antd';
import Exceljs from 'exceljs';
import { Buffer } from 'buffer';
import { useState } from 'react';
import { importUserApi } from '@/services/api';
interface IProps {
    openModalImport: boolean;
    setOpenModalImport: (v: boolean) => void;
}
interface IDataImport {
    key: string;
    fullName: string;
    email: string;
    phone: string;
}
const { Dragger } = Upload;

const ImportCategory = (props: IProps) => {
    const { setOpenModalImport, openModalImport } = props;
    const { message } = App.useApp();
    const [dataImport, setDataImport] = useState<IDataImport[]>([]);
    const propsUpload: UploadProps = {
        name: 'file',
        multiple: false,
        maxCount: 1,
        accept: '.csv,application/vnd.ms.excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        customRequest({ file, onSuccess }) {
            setTimeout(() => {
                if (onSuccess) onSuccess('ok');
            }, 1000);
        },
        async onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                if (info.fileList && info.fileList.length > 0) {
                    const file = info.fileList[0].originFileObj!;
                    const workBook = new Exceljs.Workbook();
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    await workBook.xlsx.load(buffer);

                    const jsonData: IDataImport[] = [];
                    workBook.worksheets.forEach(function (sheet) {
                        const firstRow = sheet.getRow(1);
                        if (!firstRow.cellCount) return;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const keys = firstRow.values as any[];

                        sheet.eachRow((row, rowNumber) => {
                            if (rowNumber == 1) return;
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const values = row.values as any;
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const obj: any = {};
                            for (let i = 1; i < keys.length; i++) {
                                obj[keys[i]] = values[i];
                            }
                            const objItem: IDataImport = {
                                key: obj.email.text,
                                fullName: obj.fullName,
                                email: obj.email.text,
                                phone: obj.phone,
                            };
                            jsonData.push(objItem);
                        });
                    });
                    setDataImport(jsonData);
                }
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };
    const handleImportData = () => {
        dataImport.forEach(async (item) => {
            const res = await importUserApi(item.fullName, item.email, item.phone);
            console.log(res);
            // if (res && res.data && typeof res.data === 'string') {
            //     const alertMessage = res.data + '';
            //     message.error(`User ${item.fullName} ${alertMessage}`);
            // } else {
            //     // message.success(`Import user ${item.fullName} success!`);
            // }
        });
        message.success('Import success');
        setOpenModalImport(false);
    };
    return (
        <>
            <Modal
                title="Import data user"
                width={'50vw'}
                open={openModalImport}
                onOk={() => handleImportData()}
                onCancel={() => {
                    setOpenModalImport(false);
                    setDataImport([]);
                }}
                okText={'Import data'}
                okButtonProps={{ disabled: dataImport.length > 0 ? false : true }}
                maskClosable={false}
                destroyOnClose={true}
            >
                <Dragger {...propsUpload}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">Support for a single upload. Only accept .csv, .xls, .xlsx</p>
                </Dragger>
                <div style={{ paddingTop: 20 }}>
                    <Table
                        title={() => <span>Data: </span>}
                        dataSource={dataImport}
                        columns={[
                            { dataIndex: 'fullName', title: 'FullName' },
                            { dataIndex: 'email', title: 'Email' },
                            { dataIndex: 'phone', title: 'Phone number' },
                        ]}
                    ></Table>
                </div>
            </Modal>
        </>
    );
};

export default ImportCategory;
