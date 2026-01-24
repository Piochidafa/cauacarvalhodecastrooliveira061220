import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import artistaFacade from '../services/facades/artistaFacade';
import albumFacade from '../services/facades/albumFacade';
import type { Artista, Album } from '../services/types/artista.types';

function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtista();
  }, [id]);

  useEffect(() => {
    const albunsSubscription = albumFacade.albuns$.subscribe(setAlbuns);
    const errorSubscription = albumFacade.error$.subscribe((error) => {
      if (error) toast.error(error);
    });

    return () => {
      albunsSubscription.unsubscribe();
      errorSubscription.unsubscribe();
    };
  }, []);

  const loadArtista = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const artistaData = await artistaFacade.getArtista(parseInt(id));
      setArtista(artistaData);
      if (artistaData) {
        await albumFacade.loadAlbunsByArtista(parseInt(id));
      }
    } catch (err) {
      toast.error('Erro ao carregar artista');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center p-5">
        <ProgressSpinner />
      </div>
    );
  }

  if (!artista) {
    return (
      <div className="p-4">
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          onClick={() => navigate('/artista')}
          className="mt-3"
        />
      </div>
    );
  }

  const actionBodyTemplate = (rowData: Album) => {
    return (
      <Button
        icon="pi pi-pencil"
        rounded
        text
        onClick={() => navigate(`/album/${rowData.id}`)}
        tooltip="Editar"
        tooltipPosition="top"
      />
    );
  };

  const header = (
    <div className="flex gap-2 align-items-center">
      <Button
        label="Novo Álbum"
        icon="pi pi-plus"
        onClick={() => navigate(`/album/novo?artistaId=${artista.id}`)}
        className="p-button-success"
      />
    </div>
  );

  return (
    <div className="p-4">
      <Button
        label="Voltar"
        icon="pi pi-arrow-left"
        onClick={() => navigate('/artista')}
        className="mb-3"
        text
      />

      <Card title={artista.nome} className="mb-4">
        <div className="field">
          <label>Criado em: {new Date(artista.createdAt).toLocaleDateString('pt-BR')}</label>
        </div>
        <div className="flex gap-2">
          <Button
            label="Editar"
            icon="pi pi-pencil"
            onClick={() => navigate(`/artista/${artista.id}/editar`)}
          />
          <Button
            label="Novo Álbum"
            icon="pi pi-plus"
            onClick={() => navigate(`/album/novo?artistaId=${artista.id}`)}
            className="p-button-success"
          />
        </div>
      </Card>

      <Card title={`Álbuns (${albuns.length})`}>
        {albuns.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-3">Este artista não possui álbuns cadastrados.</p>
            <Button
              label="Adicionar Álbum"
              icon="pi pi-plus"
              onClick={() => navigate(`/album/novo?artistaId=${artista.id}`)}
              className="p-button-success"
            />
          </div>
        ) : (
          <DataTable
            value={albuns}
            header={header}
            responsiveLayout="scroll"
            stripedRows
            tableStyle={{ minWidth: '50rem' }}
            emptyMessage="Nenhum álbum encontrado"
          >
            <Column field="id" header="ID" style={{ width: '80px' }} />
            <Column field="nome" header="Nome" />
            <Column body={actionBodyTemplate} style={{ width: '80px' }} />
          </DataTable>
        )}
      </Card>
    </div>
  );
}

export default ArtistDetail;
