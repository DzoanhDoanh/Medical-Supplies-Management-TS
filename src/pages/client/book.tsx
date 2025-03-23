import BookDetail from '@/components/client/book/book.detail';
import BookLoader from '@/components/client/book/book.loader';
import { getBookByIdApi } from '@/services/api';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const BookPage: React.FC = () => {
    const { id } = useParams();
    const [currentBook, setCurrentBook] = useState<IBook | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            if (id) {
                setTimeout(async () => {
                    const res = await getBookByIdApi(id);
                    if (res && res.data) {
                        setCurrentBook(res.data);
                        setLoading(false);
                    }
                }, 500);
            }
        };
        fetchBook();
    }, [id]);
    return <div>{loading ? <BookLoader /> : <BookDetail currentBook={currentBook} />}</div>;
};

export default BookPage;
