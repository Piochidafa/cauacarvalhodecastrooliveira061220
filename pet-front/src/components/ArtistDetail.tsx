import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import artistaFacade from '../services/facades/artistaFacade';
import albumService from '../services/api/albumService';
import type { Artista, Album } from '../services/types/artista.types';
import { Image } from 'primereact/image';
import AlbumModal from './AlbumModal';
import ArtistCreateModal from './ArtistCreateModal';

import svgDisco from "../assets/ArtistaAssets/disco-svgrepo-com-white.svg";
import defaultAlbumCover from "../assets/ArtistaDetailsAssets/defaultAlbumCover.png"

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
  const [editArtistImageFile, setEditArtistImageFile] = useState<File | null>(null);
  const [editArtistPreviewUrl, setEditArtistPreviewUrl] = useState<string | null>(null);
  const [editCurrentImageUrl, setEditCurrentImageUrl] = useState<string | null>(null);
  const [updatingArtist, setUpdatingArtist] = useState(false);
  const [albumSearchTerm, setAlbumSearchTerm] = useState('');
  const [albumSortOrder, setAlbumSortOrder] = useState<'asc' | 'desc'>('asc');
  const [albumPage, setAlbumPage] = useState(0);
  const [albumRows, setAlbumRows] = useState(8);
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
      setEditCurrentImageUrl(artistaData?.imageUrl || null);
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

  const handleEditArtistImageChange = (file: File | null) => {
    setEditArtistImageFile(file);
    if (editArtistPreviewUrl) {
      URL.revokeObjectURL(editArtistPreviewUrl);
    }
    if (file) {
      setEditArtistPreviewUrl(URL.createObjectURL(file));
    } else {
      setEditArtistPreviewUrl(null);
    }
  };

  const handleRemoveArtistImage = async () => {
    if (!artista) return;
    try {
      await artistaFacade.removeArtistaImage(artista.id);
      setEditArtistImageFile(null);
      if (editArtistPreviewUrl) {
        URL.revokeObjectURL(editArtistPreviewUrl);
      }
      setEditArtistPreviewUrl(null);
      setEditCurrentImageUrl(null);
      await loadArtista();
      toast.success('Imagem removida com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover imagem');
    }
  };

  const handleToggleAlbumSort = () => {
    setAlbumSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
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
      <div className="min-h-screen flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="pi pi-play text-5xl text-500" />
          <h2 className="text-2xl font-bold mt-3">Artista não encontrado</h2>
          <Button
            label="Voltar"
            icon="pi pi-arrow-left gap-2 w-5 p-2 px-4 font-bold"
            onClick={() => navigate('/')}
            className="mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen"
    >
      <div className="relative" style={{ background: 'linear-gradient(180deg, #ba68c87f, rgba(0,0,0,0.85))' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.8))' }} />
        <div
          className="relative"
          style={{ paddingLeft: '20vh', paddingRight: '20vh', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}
        >
          <Button
            label="Voltar"
            icon="pi pi-arrow-left px-2"
            onClick={() => navigate('/')}
            className="p-button-text mb-4"
          />

          <div className="flex flex-column md:flex-row gap-4 align-items-start">
            <div className="border-round-2xl overflow-hidden shadow-4" style={{ width: 220, height: 220 }}>
              {artista.imageUrl ? (
                <Image
                  src={artista.imageUrl}
                  alt={artista.nome}
                  imageStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div className="flex align-items-center justify-content-center h-full w-full surface-800">
                  <i className="pi pi-user text-5xl text-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="text-sm font-medium text-green-300 mb-2">ARTISTA</p>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{artista.nome}</h1>
                  <div className="flex align-items-center gap-1 text-300">
                    <img src={svgDisco} alt="Disco" style={{ width: 30, height: 30 }} />
                    <span className="text-lg" style={{color: 'white'}}>{albumTotalRecords} álbuns</span>
                  </div>
                </div>
                <Button
                  label="Editar"
                  icon="pi pi-pencil"
                  onClick={() => {
                    setEditArtistName(artista.nome);
                    setEditCurrentImageUrl(artista.imageUrl || null);
                    setEditArtistImageFile(null);
                    if (editArtistPreviewUrl) {
                      URL.revokeObjectURL(editArtistPreviewUrl);
                      setEditArtistPreviewUrl(null);
                    }
                    setEditDialogVisible(true);
                  }}
                  className="p-button-outlined"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ paddingLeft: '20vh', paddingRight: '20vh', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div className="flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <h2 className="text-2xl font-bold">Álbuns</h2>
          <Button
            label="Novo Álbum"
            icon="pi pi-plus"
            onClick={() => {
              setSelectedAlbum(null);
              setAlbumModalVisible(true);
            }}
            className="p-button-success"
          />
        </div>


        {albumsLoading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : albuns.length === 0 ? (
          <div className="flex flex-column align-items-center justify-content-center py-6 text-center surface-100 border-round-2xl">
            <i className="pi pi-image text-5xl text-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Nenhum álbum encontrado</h3>
            <p className="text-500 mb-3">{albumSearchTerm != '' ? 'Album nao encontrado' : 'Este artista ainda não possui álbuns'} </p>
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
            <div className="grid">
              {albuns.map((album) => (
                <div key={album.id} className="col-12 sm:col-6 md:col-4 lg:col-3">
                  <div
                    className="hover:shadow-4 border-2 p-3 transition-duration-200 h-full border-round-xl"
                    onClick={() => {
                      setSelectedAlbum(album);
                      setAlbumModalVisible(true);
                      

                    }}
                    style={{ display: 'flex', flexDirection: 'column', minHeight: '0', cursor: 'pointer' }}
                  >
                    <div className="flex flex-column h-full" style={{ minHeight: '0', gap: '0.75rem' }}>
                      <div
                        className="border-round overflow-hidden "
                        style={{
                          backgroundColor: '#050202',
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
                                  imageStyle={{ width: '100%', height: '1%', objectFit: 'cover' }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Image
                            src={defaultAlbumCover}
                            alt={`Capa padrão - ${album.nome}`}
                            style={{ width: '100%', height: '100%' }}
                            imageStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>

                      <div className="flex flex-column gap-2">
                        <div className="flex flex-row justify-content-between align-items-center">
                        <span className="font-semibold text-lg" style={{ wordBreak: 'break-word' }}>{album.nome}</span>


                            <div className="flex gap-2 h-2rem">
                              <Button
                                icon="pi pi-trash"
                                className="p-button-sm p-button-danger p-1"
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {albuns.length > 0 && (
              <div className="mt-3 flex flex-row justify-content-center align-content-center">
                <Paginator
                  first={albumPage * albumRows}
                  rows={albumRows}
                  totalRecords={albumTotalRecords}
                  onPageChange={(e: PaginatorChangeEvent) => {
                    setAlbumPage(e.page);
                    setAlbumRows(e.rows);
                  }}
                  rowsPerPageOptions={[8, 12, 24, 48]}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} álbuns"
                />
              </div>
            )}
          </>
        )}
      </main>

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
            setEditArtistImageFile(null);
            if (editArtistPreviewUrl) {
              URL.revokeObjectURL(editArtistPreviewUrl);
            }
            setEditArtistPreviewUrl(null);
            setEditCurrentImageUrl(artista?.imageUrl || null);
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
            if (editArtistImageFile) {
              await artistaFacade.uploadArtistaImage(artista.id, editArtistImageFile);
              setEditArtistImageFile(null);
              if (editArtistPreviewUrl) {
                URL.revokeObjectURL(editArtistPreviewUrl);
              }
              setEditArtistPreviewUrl(null);
            }
            toast.success('Artista atualizado com sucesso!');
            setEditDialogVisible(false);
            await loadArtista();
          } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar artista');
          } finally {
            setUpdatingArtist(false);
          }
        }}
        imagePreviewUrl={editArtistPreviewUrl}
        currentImageUrl={editCurrentImageUrl}
        onImageChange={handleEditArtistImageChange}
        onRemoveImage={handleRemoveArtistImage}
      />
    </div>
  );
}

export default ArtistDetail;
