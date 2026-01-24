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

  useEffect(() => {
    const loadArtistas = async () => {
      try {
        await artistaFacade.loadArtistas(page, rows, 'nome', sortOrder);
      } catch (err) {
        toast.error('Erro ao carregar artistas');
      }
    };
    loadArtistas();
  }, [page, rows, sortOrder]);

  useEffect(() => {
    const artistasSubscription = artistaFacade.artistas$.subscribe((newArtistas) => {
      setArtistas(newArtistas);
      loadCoverUrls(newArtistas);
    });
    const loadingSubscription = artistaFacade.loading$.subscribe(setLoading);
    const errorSubscription = artistaFacade.error$.subscribe((error) => {
      if (error) toast.error(error);
    });
    const paginationSubscription = artistaFacade.pagination$.subscribe((pagination) => {
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
          try {
            const covers = await albumCoverService.getCoversByAlbumId(album.id);
            if (covers && covers.length > 0) {
              const first = covers[0];
              const url = first.url || (first.id ? await albumCoverService.getCoverUrl(first.id) : '');
              if (url) urls[album.id] = url;
            }
          } catch (err) {
            // Ignorar erro se capa não existir
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
    <div className="flex flex-column gap-2">
      <div className="flex gap-2 align-items-center flex-wrap">
        <InputText
          placeholder="Buscar artista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadArtistas()}
          style={{ flex: '1 1 250px' }}
        />
        <Button
          label="Buscar"
          icon="pi pi-search"
          onClick={loadArtistas}
        />
      </div>
      <div className="flex gap-2 align-items-center flex-wrap">
        <Dropdown
          value={sortOrder}
          onChange={(e) => setSortOrder(e.value)}
          options={sortOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Ordenar..."
        />
        <Button
          label="Novo Artista"
          icon="pi pi-plus"
          onClick={() => navigate('/artista/novo')}
          className=""
        />
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
            <div className="mb-4">{header}</div>
            <div className="grid" style={{ flex: 1, overflow: 'auto' }}>
              {artistas.map((artista) => (
                <div key={artista.id} className="col-12 md:col-6 lg:col-4 xl:col-3">
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
                        <div className="flex-grow-1" style={{ minHeight: '0', overflow: 'hidden' }}>
                          <span className="text-sm font-semibold block mb-2">
                            Álbuns ({artista.quantidadeAlbuns || 0})
                          </span>
                          <div className="grid gap-1">
                            {artista.albuns.slice(0, 4).map((album) => (
                              <div key={album.id} className="col-6">
                                <div
                                  className="border-round overflow-hidden"
                                  style={{
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {coverUrls[album.id] ? (
                                    <img
                                      src={coverUrls[album.id]}
                                      alt={album.nome}
                                      style={{
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
                                      <i className="pi pi-image text-lg text-surface-400"></i>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-grow-1 w-full flex flex-column align-items-center justify-content-center">
                          <div
                            style={{
                              backgroundColor: '#e8e8e8',
                              color: '#999',
                              width: '100%',
                              height: '25vh',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '0.5rem'
                            }}
                          >
                            <i className="pi pi-question-circle text-5xl"></i>
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
    </div>
  );
}

export default ArtistList;
