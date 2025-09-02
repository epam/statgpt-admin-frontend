'use client';

import { FC, useEffect, useState } from 'react';

import {
  addTerm,
  getChannelTerms,
  removeChannelTerm,
  updateChannelTerms,
} from '@/src/app/channels/actions';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { Loader } from '@/src/components/BaseComponents/Loader/Loader';
import { GridView } from '@/src/components/GridView/GridView';
import { EntityOperation } from '@/src/constants/columns/action';
import { ChannelTerm } from '@/src/models/channel';
import { GridOptions } from 'ag-grid-community';
import { ActionColumn } from './ActionColumn/ActionColumn';
import { AddTerm } from './AddTerm';

interface Props {
  selectedChannelId: string;
}

export const TermsView: FC<Props> = ({ selectedChannelId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddView, setIsLoadingAddView] = useState(false);
  const [terms, setTerms] = useState<ChannelTerm[]>([]);
  const [editableTerm, setEditableTerm] = useState<ChannelTerm | undefined>(
    void 0,
  );

  const remove = (data: ChannelTerm) => {
    setIsLoading(true);
    removeChannelTerm(data?.id?.toString() as string).then(() => {
      setTerms(terms.filter((t) => t.id !== data.id));
      setIsLoading(false);
    });
  };

  const saveTerms = () => {
    setIsLoading(true);
    const isAdd = !terms.some((t) => t.id === editableTerm?.id);
    (isAdd
      ? addTerm(selectedChannelId, editableTerm as ChannelTerm)
      : updateChannelTerms(editableTerm as ChannelTerm)
    ).then(() => {
      if (isAdd) {
        setTerms([...terms, editableTerm as ChannelTerm]);
      } else {
        setTerms(
          terms.map((t) =>
            t.id === editableTerm?.id ? (editableTerm as ChannelTerm) : t,
          ),
        );
      }
      setIsLoadingAddView(false);
      setEditableTerm(undefined);
      setIsLoading(false);
    });
  };

  const columns = [
    {
      field: 'term',
      headerName: 'Term',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'definition',
      headerName: 'Definition',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'source',
      headerName: 'Source',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'domain',
      headerName: 'Domain',
      filter: 'agTextColumnFilter',
    },
    {
      width: 32,
      maxWidth: 32,
      cellRenderer: ActionColumn,
      cellClass: 'ag-grid__action-column',
      cellRendererParams: {
        remove: remove,
        items: [EntityOperation.Edit, EntityOperation.Delete],
        edit: (data?: ChannelTerm) => {
          setEditableTerm(data);
          setIsLoadingAddView(true);
        },
      },
    },
  ];

  const additionalOptions: GridOptions = {
    stopEditingWhenCellsLoseFocus: true,
    onCellClicked: (e) => {
      if (e.colDef.field == null) {
        return;
      }
      if (e.data) {
        setEditableTerm(e.data as ChannelTerm);
        setIsLoadingAddView(true);
      }
    },
  };

  useEffect(() => {
    setIsLoading(true);
    getChannelTerms(selectedChannelId).then((terms) => {
      setTerms(terms || []);
      setIsLoading(false);
    });
  }, [selectedChannelId]);

  const add = () => {
    const newTerm: ChannelTerm = {
      term: '',
      definition: '',
      source: '',
    };
    setEditableTerm(newTerm);
    setIsLoadingAddView(true);
  };

  return isLoading ? (
    <div className="flex items-center w-full justify-center h-full">
      <Loader />
    </div>
  ) : (
    <div className="bg-layer-2 flex flex-col h-full common-paddings">
      <div className="flex flex-row items-center justify-between mb-3">
        <h1 className="mb-4">Terms</h1>
        {isAddView ? (
          <div className="flex flex-row items-center gap-x-3">
            <Button
              cssClass="secondary"
              title="Discard"
              onClick={() => {
                setIsLoadingAddView(false);
                setEditableTerm(undefined);
              }}
            />
            <Button
              cssClass="primary"
              title="Save"
              onClick={() => saveTerms()}
            />
          </div>
        ) : (
          <Button
            cssClass="primary ml-3"
            title="Add Term"
            onClick={() => add()}
          />
        )}
      </div>
      <div className="flex-1 min-h-0">
        {isAddView ? (
          <AddTerm
            onValuesChange={(e) => setEditableTerm(e)}
            term={editableTerm as ChannelTerm}
          />
        ) : (
          <GridView
            colDefs={columns}
            data={terms}
            emptyDataTitle="No terms"
            additionalOptions={additionalOptions}
          />
        )}
      </div>
    </div>
  );
};
