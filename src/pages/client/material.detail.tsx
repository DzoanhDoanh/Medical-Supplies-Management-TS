import MaterialDetail from '@/components/client/medical-detail/medical.detail';
import MaterialLoader from '@/components/client/medical-detail/medical.loader';
import { getSupplyByIdApi } from '@/services/api';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const Material: React.FC = () => {
    const { id } = useParams();
    const [currentMaterial, setCurrentMaterial] = useState<ISupplies | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            if (id) {
                setTimeout(async () => {
                    const res = await getSupplyByIdApi(id);
                    if (res && res.data) {
                        setCurrentMaterial(res.data);
                        setLoading(false);
                    }
                }, 500);
            }
        };
        fetchBook();
    }, [id]);
    return <div>{loading ? <MaterialLoader /> : <MaterialDetail currentMaterial={currentMaterial} />}</div>;
};

export default Material;
