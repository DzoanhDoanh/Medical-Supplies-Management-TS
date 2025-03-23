/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { addBookApi, getCategoryApi, getCategoryByIdApi, updateBookApi } from '@/services/api';
import { App, Divider, Form, Modal, Input, Select, Upload, Row, Col, InputNumber } from 'antd';
import type { FormProps } from 'antd';
import { useEffect, useState } from 'react';
import { Rule } from 'antd/es/form';
import { PlusOutlined } from '@ant-design/icons';

interface IProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IBook | null) => void;
    dataUpdate: IBook | null;
}
type FieldType = {
    mainText: string;
    author: string;
    price: number;
    category: string;
    quantity: number;
    thumbnail?: any;
    slider?: any;
};
const { Option } = Select;
const UpdateBook = (props: IProps) => {
    const { openModalUpdate, setOpenModalUpdate, dataUpdate, setDataUpdate, refreshTable } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [listCategory, setListCategory] = useState<ICategory[]>([]);

    // start handle image
    const [previewOpenThumb, setPreviewOpenThumb] = useState(false);
    const [previewImageThumb, setPreviewImageThumb] = useState<string>('');
    const [fileListThumb, setFileListThumb] = useState<any[]>([]);

    const [previewOpenSlide, setPreviewOpenSlide] = useState(false);
    const [previewImageSlide, setPreviewImageSlide] = useState<string>('');
    const [fileListSlide, setFileListSlide] = useState<any[]>([]);
    const [form] = Form.useForm();
    const { message } = App.useApp();

    // Xử lý hiển thị ảnh preview
    const handlePreview = async (file: any) => {
        setPreviewImageThumb(file.thumbUrl || file.url);
        setPreviewOpenThumb(true);
    };
    const handlePreviewSlide = async (file: any) => {
        setPreviewImageSlide(file.thumbUrl || file.url);
        setPreviewOpenSlide(true);
    };
    // Xử lý thêm file vào danh sách (không gửi lên server ngay)
    const handleChange = ({ fileList }: any) => {
        setFileListThumb(fileList);
    };
    const handleChangeSlide = ({ fileList }: any) => {
        setFileListSlide(fileList);
    };
    const normFile = (e: any) => {
        console.log('File event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };
    // end handle image

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                id: dataUpdate.id,
                mainText: dataUpdate.mainText,
                category: dataUpdate.category,
                author: dataUpdate.author,
                price: dataUpdate.price,
                quantity: dataUpdate.quantity,
                createAt: dataUpdate.createAt,
            });
        }
        const fetchCategory = async () => {
            const res = await getCategoryApi();
            if (res && res.data) {
                setListCategory(res.data);
            }
        };
        fetchCategory();
    }, [dataUpdate]);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        try {
            const { author, category, mainText, price, quantity } = values;
            if (fileListThumb.length === 0) {
                message.warning('Chưa có file nào để gửi lên!');
                return;
            }
            if (fileListSlide.length === 0) {
                message.warning('Chưa có file nào để gửi lên!');
                return;
            }
            const fileObj = fileListThumb[0].originFileObj;
            // Chuyển file thành base64
            const reader = new FileReader();
            reader.readAsDataURL(fileObj);
            const base64 = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });

            const uploadedFiles = [];
            for (const file of fileListSlide) {
                const fileObj = file.originFileObj;

                // Chuyển file thành base64
                const reader = new FileReader();
                reader.readAsDataURL(fileObj);
                const base64 = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                });
                uploadedFiles.push(base64);
            }
            const categoryName = await getCategoryByIdApi(category);
            const res = await updateBookApi(
                dataUpdate?.id || '',
                base64,
                uploadedFiles,
                mainText,
                author,
                price,
                quantity,
                categoryName.data?.categoryName + '',
            );
            if (res && res.data) {
                message.success('Success!');
                setIsSubmit(false);
                form.resetFields();
                refreshTable();
                setOpenModalUpdate(false);
            } else {
                message.error('error!');
                setIsSubmit(false);
            }
        } catch (error) {
            console.log(error);
            message.error('Error: ' + error);
            setIsSubmit(false);
        }
    };
    const mainTextRules: Rule[] = [{ required: true, message: 'Main text is required' }];
    const authorRules: Rule[] = [{ required: true, message: 'Author is required' }];
    const priceRules: Rule[] = [
        { required: true, message: 'Price is required' },
        { type: 'number', min: 0, message: 'Price must be a positive number' },
    ];
    const quantityRules: Rule[] = [{ required: true, message: 'Quantity is required' }];
    return (
        <>
            <Modal
                title="Update book"
                open={openModalUpdate}
                onOk={() => {
                    form.submit();
                }}
                onCancel={() => {
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                    form.resetFields();
                }}
                okText={'Update'}
                cancelText="Cancel"
                confirmLoading={isSubmit}
                width={800}
            >
                <Divider />
                <Form form={form} name="basic" layout="vertical" onFinish={onFinish} autoComplete="off">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item<FieldType> label="Main Text" name="mainText" rules={mainTextRules}>
                                <Input placeholder="Enter main text" />
                            </Form.Item>

                            <Form.Item<FieldType> label="Author" name="author" rules={authorRules}>
                                <Input placeholder="Enter author name" />
                            </Form.Item>

                            <Form.Item<FieldType> label="Price" name="price" rules={priceRules}>
                                <InputNumber<number>
                                    defaultValue={1000}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                    addonAfter={'đ'}
                                />
                            </Form.Item>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Form.Item
                                    label="Thumbnail"
                                    name="thumbnail"
                                    valuePropName="fileList"
                                    getValueFromEvent={normFile}
                                >
                                    <Upload
                                        listType="picture-card"
                                        onPreview={handlePreview}
                                        onChange={handleChange}
                                        fileList={fileListThumb}
                                        beforeUpload={() => false}
                                        maxCount={1}
                                        multiple
                                    >
                                        {fileListThumb.length >= 8 ? null : (
                                            <div>
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>Select file</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>

                                <Form.Item
                                    label="Slider Images"
                                    name="slider"
                                    valuePropName="fileList"
                                    getValueFromEvent={normFile}
                                >
                                    <Upload
                                        listType="picture-card"
                                        onPreview={handlePreviewSlide}
                                        onChange={handleChangeSlide}
                                        fileList={fileListSlide}
                                        beforeUpload={() => false}
                                        multiple
                                    >
                                        {fileListSlide.length >= 8 ? null : (
                                            <div>
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>Select file</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </div>
                        </Col>
                        <Col span={12}>
                            <Form.Item<FieldType> label="Category" name="category" rules={[{ required: true }]}>
                                <Select placeholder="Select category" allowClear>
                                    {listCategory &&
                                        listCategory.map((category) => (
                                            <Option key={category.id} value={category.id}>
                                                {category.categoryName}
                                            </Option>
                                        ))}
                                </Select>
                            </Form.Item>

                            <Form.Item<FieldType> label="Quantity" name="quantity" rules={quantityRules}>
                                <Input type="number" placeholder="Enter quantity" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};
export default UpdateBook;
