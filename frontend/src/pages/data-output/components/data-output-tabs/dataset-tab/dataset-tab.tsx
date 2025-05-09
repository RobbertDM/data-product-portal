import { Button, Flex, Form } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Searchbar } from '@/components/form';
import { useModal } from '@/hooks/use-modal.tsx';
import { selectCurrentUser } from '@/store/features/auth/auth-slice.ts';
import { useCheckAccessQuery } from '@/store/features/authorization/authorization-api-slice.ts';
import { useGetDataOutputByIdQuery } from '@/store/features/data-outputs/data-outputs-api-slice.ts';
import { useGetDataProductByIdQuery } from '@/store/features/data-products/data-products-api-slice.ts';
import { AuthorizationAction } from '@/types/authorization/rbac-actions.ts';
import type { DataOutputDatasetLink } from '@/types/data-output';
import { SearchForm } from '@/types/shared';
import { getIsDataProductOwner } from '@/utils/data-product-user-role.helper.ts';

import { AddDatasetPopup } from '../../../../data-product/components/data-product-tabs/data-output-tab/components/add-dataset-popup/add-dataset-popup.tsx';
import { DatasetTable } from './components/dataset-table/dataset-table.component.tsx';
import styles from './dataset-tab.module.scss';

type Props = {
    dataOutputId: string;
};

function filterDatasets(datasetLinks: DataOutputDatasetLink[], searchTerm: string) {
    return (
        datasetLinks.filter(
            (datasetLink) =>
                datasetLink?.dataset?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                datasetLink?.dataset?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
        ) ?? []
    );
}

export function DatasetTab({ dataOutputId }: Props) {
    const { isVisible, handleOpen, handleClose } = useModal();
    const user = useSelector(selectCurrentUser);
    const { t } = useTranslation();
    const { data: dataOutput, isFetching: isFetchingInitialValues } = useGetDataOutputByIdQuery(dataOutputId || '', {
        skip: !dataOutputId,
    });
    const { data: dataProduct } = useGetDataProductByIdQuery(dataOutput?.owner.id ?? '', {
        skip: !dataOutput?.owner.id || isFetchingInitialValues || !dataOutputId,
    });
    const { data: access } = useCheckAccessQuery(
        {
            resource: dataProduct?.id,
            action: AuthorizationAction.DATA_PRODUCT__REQUEST_DATA_OUTPUT_LINK,
        },
        { skip: !dataProduct },
    );
    const canAddDatasetNew = access?.allowed || false;
    const [searchForm] = Form.useForm<SearchForm>();
    const searchTerm = Form.useWatch('search', searchForm);

    const filteredDatasets = useMemo(() => {
        return filterDatasets(dataOutput?.dataset_links ?? [], searchTerm);
    }, [dataOutput?.dataset_links, searchTerm]);

    const isDataOutputOwner = useMemo(() => {
        if (!dataProduct || !user) return false;
        return getIsDataProductOwner(dataProduct, user.id) || user.is_admin;
    }, [dataProduct, user]);

    return (
        <>
            <Flex vertical className={styles.container}>
                <Searchbar
                    placeholder={t('Search datasets by name')}
                    formItemProps={{ initialValue: '' }}
                    form={searchForm}
                    actionButton={
                        <Button
                            disabled={!(canAddDatasetNew || isDataOutputOwner)}
                            type={'primary'}
                            className={styles.formButton}
                            onClick={handleOpen}
                        >
                            {t('Add Dataset')}
                        </Button>
                    }
                />

                <DatasetTable
                    isCurrentDataOutputOwner={isDataOutputOwner}
                    dataOutputId={dataOutputId}
                    datasets={filteredDatasets}
                />
            </Flex>
            {isVisible && <AddDatasetPopup onClose={handleClose} isOpen={isVisible} dataOutputId={dataOutputId} />}
        </>
    );
}
