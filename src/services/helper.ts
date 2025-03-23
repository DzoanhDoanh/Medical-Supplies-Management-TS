import dayjs from 'dayjs';

export const FORMAT_DATE = 'YYYY-MM-DD';
export const FORMAT_DATE_VN = 'DD-MM-YYYY';
export const MAX_UPLOAD_IMAGE_SIZE = 2;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dateRangeValidate = (dateRange: any) => {
    if (!dateRange) return undefined;
    const startDate = dayjs(dateRange[0], FORMAT_DATE).toDate();
    const endDate = dayjs(dateRange[1], FORMAT_DATE).toDate();

    return [startDate, endDate];
};
