import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import artistaFacade from '../services/facades/artistaFacade';
import albumService from '../services/api/albumService';
import type { Artista, Album } from '../services/types/artista.types';
import { Image } from 'primereact/image';
import AlbumModal from './AlbumModal';
import ArtistCreateModal from './ArtistCreateModal';

interface PaginatorChangeEvent {
  page: number;
  rows: number;
  first: number;
}

function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverUrls, setCoverUrls] = useState<Record<number, string[]>>({});
  const [cachedCoverUrls, setCachedCoverUrls] = useState<Record<number, string[]>>({});
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editArtistName, setEditArtistName] = useState('');
  const [updatingArtist, setUpdatingArtist] = useState(false);
  const [albumActionsEnabled, setAlbumActionsEnabled] = useState(true);
  const [albumSearchTerm, setAlbumSearchTerm] = useState('');
  const [albumSortOrder, setAlbumSortOrder] = useState<'asc' | 'desc'>('asc');
  const [albumPage, setAlbumPage] = useState(0);
  const [albumRows, setAlbumRows] = useState(12);
  const [albumTotalRecords, setAlbumTotalRecords] = useState(0);
  const [albumsLoading, setAlbumsLoading] = useState(false);

  useEffect(() => {
    loadArtista();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchAlbuns();
  }, [id, albumPage, albumRows, albumSortOrder]);

  useEffect(() => {
    if (albuns.length === 0) return;
    setCoverUrls(buildCoverUrls(albuns, cachedCoverUrls));
  }, [cachedCoverUrls, albuns]);

  const loadArtista = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const artistaData = await artistaFacade.getArtista(parseInt(id));
      setArtista(artistaData);
      if (artistaData?.albuns) {
        const urlsFromArtist = buildCoverUrls(artistaData.albuns, {});
        setCachedCoverUrls(urlsFromArtist);
      } else if (!artistaData) {
        setAlbuns([]);
        setCoverUrls({});
        setCachedCoverUrls({});
      }
    } catch (err) {
      toast.error('Erro ao carregar artista');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbuns = async (pageOverride?: number, rowsOverride?: number) => {
    if (!id) return;
    setAlbumsLoading(true);
    try {
      const pageToUse = pageOverride ?? albumPage;
      const rowsToUse = rowsOverride ?? albumRows;
      const trimmed = albumSearchTerm.trim();

      const response = trimmed
        ? await albumService.searchAlbunsByArtista(trimmed, parseInt(id), pageToUse, rowsToUse, 'nome', albumSortOrder)
        : await albumService.getAlbunsByArtista(parseInt(id), pageToUse, rowsToUse, 'nome', albumSortOrder);

      setAlbuns(response.content);
      setAlbumTotalRecords(response.totalElements);
      setCoverUrls(buildCoverUrls(response.content, cachedCoverUrls));
    } catch (err) {
      toast.error('Erro ao carregar álbuns');
    } finally {
      setAlbumsLoading(false);
    }
  };

  const buildCoverUrls = (albunsData: Album[], fallback: Record<number, string[]>) => {
    const urls: Record<number, string[]> = {};

    albunsData.forEach((album) => {
      const coverUrlsList = album.capas
        ? album.capas
            .slice(0, 4)
            .map((cover) => cover.url)
            .filter((url): url is string => Boolean(url))
        : [];

      if (coverUrlsList.length > 0) {
        urls[album.id] = coverUrlsList;
      } else if (fallback[album.id]?.length) {
        urls[album.id] = fallback[album.id];
      }
    });

    return urls;
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

  const header = (
    <div className="flex flex-column gap-2">
      <div className="flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="flex gap-2 align-items-center">
          <Button
            label="Novo Álbum"
            icon="pi pi-plus"
            onClick={() => {
              setSelectedAlbum(null);
              setAlbumModalVisible(true);
            }}
            className="p-button-success"
          />
          <Button
            label={albumActionsEnabled ? 'Ocultar ações' : 'Habilitar ações'}
            icon={albumActionsEnabled ? 'pi pi-eye-slash' : 'pi pi-cog'}
            onClick={() => setAlbumActionsEnabled((prev) => !prev)}
            className="p-button-outlined"
          />
        </div>

        <div className="flex gap-2 align-items-center flex-wrap">
          <Dropdown
            value={albumSortOrder}
            onChange={(e) => setAlbumSortOrder(e.value)}
            options={[
              { label: 'A-Z', value: 'asc' },
              { label: 'Z-A', value: 'desc' }
            ]}
            optionLabel="label"
            optionValue="value"
            placeholder="Ordenar..."
            style={{ height: '3.0vh', padding: '0.5vh' }}
          />
          <InputText
            placeholder="Buscar álbum..."
            value={albumSearchTerm}
            onChange={(e) => setAlbumSearchTerm(e.target.value)}
            style={{ height: '3.2vh' }}
          />
          <Button
            label="Buscar"
            icon="pi pi-search"
            style={{ padding: 6 }}
            onClick={async () => {
              setAlbumPage(0);
              await fetchAlbuns(0, albumRows);
            }}
          />
        </div>
      </div>
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

      <Card
        title={artista.nome}
        className="mb-4 cursor-pointer"
        onClick={() => {
          setEditArtistName(artista.nome);
          setEditDialogVisible(true);
        }}
      >

        <small className=" font-bold bg-red-50 border-round p-2 inline-block">
          Clique no card do artista para editar.
        </small>
        <div className="flex gap-2">
          <Button
            label="Editar"
            icon="pi pi-pencil"
            onClick={(event) => {
              event.stopPropagation();
              setEditArtistName(artista.nome);
              setEditDialogVisible(true);
            }}
          />
          <Button
            label="Novo Álbum"
            icon="pi pi-plus"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedAlbum(null);
              setAlbumModalVisible(true);
            }}
            className="p-button-success"
          />
        </div>
      </Card>

      <Card title={`Álbuns (${albumTotalRecords})`}>
        {albumsLoading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : albuns.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-3">Este artista não possui álbuns cadastrados.</p>
            <Button
              label="Adicionar Álbum"
              icon="pi pi-plus"
              onClick={() => {
                setSelectedAlbum(null);
                setAlbumModalVisible(true);
              }}
              className="p-button-success"
            />
          </div>
        ) : (
          <>
            <div className="mb-3">{header}</div>
            <small className="text-red-600 font-semibold bg-red-50 border-round p-2 inline-block mb-2">
              Clique no card do álbum para editar.
            </small>
            <div className="grid">
              {albuns.map((album) => (
                <div key={album.id} className="col-12 sm:col-6 md:col-4 lg:col-3">
                  <Card
                    className="hover:shadow-4 border-2 p-3 transition-duration-200 h-full card-hover"
                    onClick={() => {
                      setSelectedAlbum(album);
                      // setAlbumModalVisible(true);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', minHeight: '0' }}
                  >
                    <div className="flex flex-column h-full" style={{ minHeight: '0', gap: '0.75rem' }}>
                      <div
                        className="border-round overflow-hidden border-2"
                        style={{
                          backgroundColor: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          aspectRatio: '1 / 1',
                        }}
                      >
                        {coverUrls[album.id]?.length === 1 ? (
                          <Image
                            src={coverUrls[album.id][0]}
                            alt={album.nome}
                            style={{ width: '100%', height: '100%' }}
                            imageStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : coverUrls[album.id]?.length ? (
                          <div
                            className="gap-2"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gridAutoRows: '1fr',
                              width: '100%',
                              height: '100%'
                            }}
                          >
                            {coverUrls[album.id].slice(0, 4).map((url, index) => (
                              <div key={`${album.id}-${index}`} className="overflow-hidden">
                                <Image
                                  src={url}
                                  alt={`${album.nome} - ${index + 1}`}
                                  style={{ width: '100%', height: '100%' }}
                                  imageStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-column align-items-center justify-content-center" style={{ width: '100%', height: '100%' }}>
                            <i className="pi pi-question-circle text-2xl text-surface-400"></i>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-column gap-1">
                        <span className="font-semibold text-lg" style={{ wordBreak: 'break-word' }}>{album.nome}</span>

                        <div className=' p-3 flex flex-row justify-content-between '>
                          
                        <span className="text-sm text-500 p-2">ID: {album.id}</span>

                                              {albumActionsEnabled && (
                                                <div className="flex gap-2">
                          <Button
                            label="Editar"
                            icon="pi pi-pencil"
                            className="p-button-sm p-1"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedAlbum(album);
                              setAlbumModalVisible(true);
                            }}
                          />
                          <Button
                            label="Excluir"
                            icon="pi pi-trash"
                            className="p-button-sm p-button-danger"
                            onClick={async (event) => {
                              event.stopPropagation();
                              const confirmed = window.confirm('Deseja excluir este álbum?');
                              if (!confirmed) return;
                              try {
                                await albumService.deleteAlbum(album.id);
                                toast.success('Álbum excluído com sucesso!');
                                await fetchAlbuns();
                              } catch (error: any) {
                                toast.error(error.message || 'Erro ao excluir álbum');
                              }
                            }}
                          />
                        </div>
                      )}
                              </div>
                      </div>


                    </div>
                  </Card>
                </div>
              ))}
            </div>
            {albuns.length > 0 && (
              <div className="mt-2 flex flex-row justify-content-center align-content-center">
                <Paginator
                  first={albumPage * albumRows}
                  rows={albumRows}
                  totalRecords={albumTotalRecords}
                  onPageChange={(e: PaginatorChangeEvent) => {
                    setAlbumPage(e.page);
                    setAlbumRows(e.rows);
                  }}
                  rowsPerPageOptions={[6, 12, 24, 48]}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} álbuns"
                />
              </div>
            )}
          </>
        )}
      </Card>

      <AlbumModal
        visible={albumModalVisible}
        album={selectedAlbum}
        artistaId={artista.id}
        onHide={() => {
          setAlbumModalVisible(false);
          setSelectedAlbum(null);
        }}
        onSuccess={async () => {
          setAlbumModalVisible(false);
          setSelectedAlbum(null);
          await loadArtista();
          await fetchAlbuns();
        }}
      />

      <ArtistCreateModal
        visible={editDialogVisible}
        value={editArtistName}
        loading={updatingArtist}
        title="Editar Artista:"
        saveLabel="Atualizar"
        onChange={setEditArtistName}
        onCancel={() => {
          if (!updatingArtist) {
            setEditDialogVisible(false);
            setEditArtistName('');
          }
        }}
        onSave={async () => {
          if (!editArtistName.trim()) {
            toast.error('Nome do artista é obrigatório');
            return;
          }

          setUpdatingArtist(true);
          try {
            await artistaFacade.updateArtista(artista.id, { nome: editArtistName.trim() });
            toast.success('Artista atualizado com sucesso!');
            setEditDialogVisible(false);
            await loadArtista();
          } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar artista');
          } finally {
            setUpdatingArtist(false);
          }
        }}
      />
    </div>
  );
}

export default ArtistDetail;
