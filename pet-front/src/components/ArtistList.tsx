import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Paginator } from 'primereact/paginator';
import artistaFacade from '../services/facades/artistaFacade';
import albumCoverService from '../services/api/albumCoverService';
import type { Artista } from '../services/types/artista.types';
import { Image } from 'primereact/image';
import ArtistCreateModal from './ArtistCreateModal';

interface PaginatorChangeEvent {
  page: number;
  rows: number;
  first: number;
}

function ArtistList() {
  const navigate = useNavigate();
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(12);
  const [totalRecords, setTotalRecords] = useState(0);
  const [coverUrls, setCoverUrls] = useState<Record<number, string>>({});
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [creatingArtist, setCreatingArtist] = useState(false);

  useEffect(() => {
    const loadArtistas = async () => {
      try {
        console.log('Carregando artistas com página:', page, 'linhas:', rows);
        await artistaFacade.loadArtistas(page, rows, 'nome', sortOrder);
      } catch (err) {
        toast.error('Erro ao carregar artistas');
      }
    };
    loadArtistas();
  }, [page, rows, sortOrder]);

  useEffect(() => {
    console.log('Subscribe effect mounted');
    const artistasSubscription = artistaFacade.artistas$.subscribe((newArtistas) => {
      console.log('Artistas atualizados:', newArtistas);
      setArtistas(newArtistas);
      loadCoverUrls(newArtistas);
    });
    const loadingSubscription = artistaFacade.loading$.subscribe((loadingState) => {
      console.log('Loading state:', loadingState);
      setLoading(loadingState);
    });
    const errorSubscription = artistaFacade.error$.subscribe((error) => {
      console.log('Error:', error);
      if (error) toast.error(error);
    });
    const paginationSubscription = artistaFacade.pagination$.subscribe((pagination) => {
      console.log('Pagination:', pagination);
      setTotalRecords(pagination.totalElements);
    });

    return () => {
      artistasSubscription.unsubscribe();
      loadingSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      paginationSubscription.unsubscribe();
    };
  }, []);

  const loadCoverUrls = async (artistasData: Artista[]) => {
    const urls: Record<number, string> = {};

    for (const artista of artistasData) {
      if (artista.albuns && artista.albuns.length > 0) {
        for (const album of artista.albuns.slice(0, 4)) {
          // Usa a primeira capa que já vem do backend
          if (album.capas && album.capas.length > 0) {
            const firstCover = album.capas[0];
            try {
              // Se a URL já vem na capa, usa direto; senão busca pelo ID
              const url = firstCover.url || (firstCover.id ? await albumCoverService.getCoverUrl(firstCover.id) : '');
              if (url) urls[album.id] = url;
            } catch (err) {
              console.error('Erro ao carregar URL da capa do álbum', album.id, ':', err);
            }
          }
        }
      }
    }

    setCoverUrls(urls);
  };

  const loadArtistas = async () => {
    if (searchTerm.trim()) {
      await artistaFacade.searchArtistas(searchTerm, 0, rows);
      setPage(0);
    } else {
      await artistaFacade.loadArtistas(0, rows, 'nome', sortOrder);
      setPage(0);
    }
  };

  const handleCreateArtist = async () => {
    if (!newArtistName.trim()) {
      toast.error('Nome do artista é obrigatório');
      return;
    }

    setCreatingArtist(true);
    try {
      await artistaFacade.createArtista({ nome: newArtistName.trim() });
      toast.success('Artista criado com sucesso!');
      setCreateDialogVisible(false);
      setNewArtistName('');
      await loadArtistas();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar artista');
    } finally {
      setCreatingArtist(false);
    }
  };

  const handleRowClick = (artista: Artista) => {
    navigate(`/artista/${artista.id}`);
  };

  const sortOptions = [
    { label: 'A-Z', value: 'asc' },
    { label: 'Z-A', value: 'desc' }
  ];

  const handlePageChange = (e: PaginatorChangeEvent) => {
    setPage(e.page);
    setRows(e.rows);
  };

  const header = (
    <div className="flex flex-column gap-2 mt-4 ">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '1vh',
      }}>
      <div className="flex gap-2 align-items-center flex-wrap">
        <Button
          label="Novo Artista"
          icon="pi pi-plus"
          onClick={() => setCreateDialogVisible(true)}
          className='gap-2'
          style={{
            padding: '0.6vh'
          }}
          />
      </div>
      <div className="flex gap-2 align-items-center flex-wrap">
        <Dropdown
          value={sortOrder}
          onChange={(e) => setSortOrder(e.value)}
          style={{
            height: '3.0vh',
            padding: '0.5vh'
          }}
          options={sortOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Ordenar..."
          />
        <InputText
          placeholder="Buscar artista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ height: '3.2vh' }}
          />
        <Button
          label="Buscar"
          icon="pi pi-search"
          style={{
            padding: 6
          }}
          onClick={loadArtistas}
          />
      </div>

     </div>
    </div>
  );

  return (
    <div className="p-2 h-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <Card title="Artistas" className='p-3' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <>
            <div className="mb-2">{header}</div>
            <div className="grid" style={{ flex: 1, overflow: 'auto' }}>
              {artistas.map((artista) => (
                <div key={artista.id} className="col-12 md:col-5 lg:col-3 xl:col-3">
                  <Card
                    className="cursor-pointer hover:shadow-4 border-2 p-3 transition-duration-200 h-full"
                    onClick={() => handleRowClick(artista)}
                    style={{ display: 'flex', flexDirection: 'column', minHeight: '0' }}
                  >
                    <div className="flex flex-column h-full" style={{ minHeight: '0', gap: '0.5rem' }}>

                      <div className="flex align-items-center gap-3 pb-4" style={{ borderBottom: '1px solid #ddd' }}>
                        <i className="pi pi-user text-2xl text-primary"></i>
                        <div className="flex flex-column flex-grow-1 min-w-0">
                          <span className="font-bold text-lg" style={{ wordBreak: 'break-word' }}>{artista.nome}</span>
                          <span className="text-sm text-500">ID: {artista.id}</span>
                        </div>
                      </div>

                      {artista.albuns && artista.albuns.length > 0 ? (
                        <div className="flex-grow-1 flex flex-column" style={{ minHeight: '0', overflow: 'hidden' }}>
                          <span className="text-sm font-semibold block mb-2">
                            ( {artista.quantidadeAlbuns || 0} ) {artista.quantidadeAlbuns <= 1 ? "Album" : "Albuns"}
                          </span>
                          <div
                            className="gap-2 align-content-center justify-content-center"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gridAutoRows: '1fr',
                              width: '100%',
                              justifyItems: 'center'
                            }}
                          >
                            {artista.albuns.slice(0, 4).map((album) => (
                              <div key={album.id} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <div
                                  className="border-round overflow-hidden border-3 border-round-sm "
                                  style={{
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    margin: '0 auto',
                                    aspectRatio: '1.4 / 1',
                                    height: 'auto'
                                  }}
                                >
                                  {coverUrls[album.id] ? (
                                    <Image
                                      src={coverUrls[album.id]}
                                      alt={album.nome}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'contain'
                                      }}
                                      imageStyle={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="flex flex-column align-items-center justify-content-center"
                                      style={{ width: '100%', height: '100%' }}
                                    >
                                      <i className="pi pi-question-circle text-lg text-surface-400"></i>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-sm font-semibold block mb-2">
                            ( {artista.quantidadeAlbuns || 0} ) Albuns
                          </span>
                        <div className="flex-grow-1 w-full flex flex-column align-items-center justify-content-center">
                          <div
                            style={{
                              backgroundColor: '#e8e8e8',
                              color: '#999',
                              width: '100%',
                              height: '30vh',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '0.5rem'
                            }}
                            >
                            
                            <i className=" text-bold text-2xl">Nenhum álbum encontrado</i>
                          </div>
                        </div>
                      </div>
                      )}

                    </div>
                  </Card>

                </div>
              ))}
            </div>
            {artistas.length === 0 && (
              <div className="text-center p-5 text-500">
                Nenhum artista encontrado
              </div>
            )}
            {artistas.length > 0 && (
              <div className=" mt-2 flex flex-row justify-content-center align-content-center">
                <Paginator
                  first={page * rows}
                  rows={rows}
                  totalRecords={totalRecords}
                  onPageChange={handlePageChange}
                  rowsPerPageOptions={[6, 12, 24, 48]}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} artistas"
                />
              </div>
            )}
          </>
        )}
      </Card>

      <ArtistCreateModal
        visible={createDialogVisible}
        value={newArtistName}
        loading={creatingArtist}
        onChange={setNewArtistName}
        onCancel={() => {
          if (!creatingArtist) {
            setCreateDialogVisible(false);
            setNewArtistName('');
          }
        }}
        onSave={handleCreateArtist}
      />
    </div>
  );
}

export default ArtistList;
