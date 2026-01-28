import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Paginator } from 'primereact/paginator';
import defaultUserPFP from '../assets/ArtistaAssets/mickey.jpg'
import artistaFacade from '../services/facades/artistaFacade';
import albumCoverService from '../services/api/albumCoverService';
import type { Artista } from '../services/types/artista.types';
import { Image } from 'primereact/image';
import ArtistCreateModal from './ArtistCreateModal';
import { AnimatePresence, motion } from 'motion/react';

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
  const [rows, setRows] = useState(8);
  const [totalRecords, setTotalRecords] = useState(0);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistImageFile, setNewArtistImageFile] = useState<File | null>(null);
  const [newArtistPreviewUrl, setNewArtistPreviewUrl] = useState<string | null>(null);
  const [creatingArtist, setCreatingArtist] = useState(false);
  const [artistActionsEnabled, setArtistActionsEnabled] = useState(true);

  useEffect(() => {
    const fetchArtistas = async () => {
      try {
        console.log('Carregando artistas com página:', page, 'linhas:', rows);
        if (searchTerm.trim()) {
          await artistaFacade.searchArtistas(searchTerm, page, rows, 'nome', sortOrder);
        } else {
          await artistaFacade.loadArtistas(page, rows, 'nome', sortOrder);
        }
      } catch (err) {
        toast.error('Erro ao carregar artistas');
      }
    };
    fetchArtistas();
  }, [page, rows, sortOrder]);

  useEffect(() => {
    console.log('Subscribe effect mounted');
    const artistasSubscription = artistaFacade.artistas$.subscribe((newArtistas) => {
      console.log('Artistas atualizados:', newArtistas);
      setArtistas(newArtistas);
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


  const loadArtistas = async () => {
    if (searchTerm.trim()) {
      await artistaFacade.searchArtistas(searchTerm, 0, rows, 'nome', sortOrder);
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
      const created = await artistaFacade.createArtista({ nome: newArtistName.trim() });
      if (created?.id && newArtistImageFile) {
        await artistaFacade.uploadArtistaImage(created.id, newArtistImageFile);
      }
      toast.success('Artista criado com sucesso!');
      setCreateDialogVisible(false);
      setNewArtistName('');
      setNewArtistImageFile(null);
      if (newArtistPreviewUrl) {
        URL.revokeObjectURL(newArtistPreviewUrl);
        setNewArtistPreviewUrl(null);
      }
      await loadArtistas();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar artista');
    } finally {
      setCreatingArtist(false);
    }
  };

  const handleNewArtistImageChange = (file: File | null) => {
    setNewArtistImageFile(file);
    if (newArtistPreviewUrl) {
      URL.revokeObjectURL(newArtistPreviewUrl);
    }
    if (file) {
      setNewArtistPreviewUrl(URL.createObjectURL(file));
    } else {
      setNewArtistPreviewUrl(null);
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

  const getRegionalName = (artista: Artista) => {
    if (!artista.albuns || artista.albuns.length === 0) {
      return 'Regional não informada';
    }

    const ultimoAlbum = artista.albuns[artista.albuns.length - 1];
    return ultimoAlbum?.regional?.nome || 'Regional não informada';
  };

  const getFakeListeners = (id: number) => {
    const base = 1200;
    const extra = (id * 873) % 8500;
    return base + extra;
  };

  const header = (
    <motion.div
      className="flex flex-column gap-2 mt-2 "
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1vh'
      }}>
      <motion.div
        className="flex gap-2 align-items-center flex-wrap"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Button
          label="Novo Artista"
          icon="pi pi-plus"
          onClick={() => setCreateDialogVisible(true)}
          className='gap-2'
          style={{
            padding: '0.6vh',
          }}
          />

      </motion.div>
      <motion.div
        className="flex gap-2 align-items-center flex-wrap"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
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
      </motion.div>

     </div>
    </motion.div>
  );

  return (
    <div className="
     p-2 
     flex 
     flex-column
     h-screen
     
     " >
     
      <div title="Artistas" className='p-3  text-green-50' style={{height: '92vh', width: '85vw'}}>
        {loading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <>
            <div className="mb-2 ">{header}</div>
            <div className='
              h-full
              flex
              flex-column
              justify-content-between
            ' >
              <motion.div
                className="grid"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                <AnimatePresence>
                  {artistas.map((artista) => {
                    const regionalName = getRegionalName(artista);
                    const fakeListeners = getFakeListeners(artista.id).toLocaleString('pt-BR');

                    return (
                    <motion.div
                      key={artista.id}
                      className="col-12 md:col-5 lg:col-3 xl:col-3 h-25rem"
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      whileHover={{ y: -4, scale: 1.01 }}
                    >
                      <Card
                        className=" cursor-pointer hover:shadow-4 border-2 p-3 transition-duration-200 h-full card-hover border-round-xl"
                        onClick={() => handleRowClick(artista)}
                        style={{ display: 'flex', flexDirection: 'column', minHeight: '0' }}
                      >
                      <div className="flex flex-column h-full" style={{ minHeight: '0', gap: '0.5rem' }}>
                      <div className="flex align-items-center gap-3 pb-4 flex-column" style={{ borderBottom: '1px solid #ffffff' }}>


                        <Image  src={artista.imageUrl ? artista.imageUrl : defaultUserPFP }  imageClassName='border-circle' width="120vw" height='120vh' imageStyle={{
                          objectFit: 'cover',
                          marginTop: '1vh'
                        }}/>
                        
                        
                        <div className="flex flex-column flex-grow-1 min-w-0">
                          <div className='flex flex-row justify-content-between align-items-center '>

                            <span className=" pointer font-bold text-2xl pt-2" style={{ wordBreak: 'break-word' }}>{artista.nome}</span>
                    
                        </div>

                          <span className="text-sm text-500">ID: {artista.id}</span>
                          <div className="flex flex-row align-items-center gap-2 text-500 pt-2">
                            <span className="pi pi-map-marker" />
                            <span className="text-sm">{regionalName}</span>
                          </div>
                        </div>
                      </div>

                      {artista.albuns && artista.albuns.length > 0 ? (
                        <div className="flex-grow-1 flex flex-column" style={{ minHeight: '0', overflow: 'hidden' }}>
                          
                          <div className='flex flex-row justify-content-between px-2 py-2 align-items-center'>
                           
                          <div className='flex flex-row gap-1 '>

                          <span className='pi pi-inbox text-md p-1'/>
                          <span className="text-sm font-semibold block text-md font-bold">
                              {artista.quantidadeAlbuns || 0}  {artista.quantidadeAlbuns <= 1 ? " Album" : " Albuns"}
                          </span>
                            </div>
                            <div className="flex flex-row align-items-center gap-2 text-500 pt-1">
                            </div>
                            <div className='flex flex-row gap-1 '>
                              <span className="pi pi-chart-line text-md p-1" />
                              <span className=" text-md font-semibold p-1">{fakeListeners} ouvintes/mês</span>
                            </div>
                          </div>
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
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className='flex flex-row gap-2'>
                          <span className='pi pi-inbox'/>
                          <span className="text-sm font-semibold block mb-2">
                             {artista.quantidadeAlbuns || 0} Albuns
                          </span>
                          
                          </div>
                      </div>
                      )}

                      </div>
                    </Card>
                    </motion.div>
                    );
                  })}
                </AnimatePresence>
              {artistas.length === 0 && (
                <div className="text-center p-5 text-500">
                  Nenhum artista encontrado
                </div>
              )}
              </motion.div>
              {artistas.length > 0 && (
                <div className=" mt-2 flex flex-row justify-content-center align-content-center">
                  <Paginator
                    style={{paddingInline: '1vh'}}
                    first={page * rows}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPageChange={handlePageChange}
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} artistas"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ArtistCreateModal
        visible={createDialogVisible}
        value={newArtistName}
        loading={creatingArtist}
        onChange={setNewArtistName}
        onCancel={() => {
          if (!creatingArtist) {
            setCreateDialogVisible(false);
            setNewArtistName('');
            setNewArtistImageFile(null);
            if (newArtistPreviewUrl) {
              URL.revokeObjectURL(newArtistPreviewUrl);
            }
            setNewArtistPreviewUrl(null);
          }
        }}
        onSave={handleCreateArtist}
        imagePreviewUrl={newArtistPreviewUrl}
        onImageChange={handleNewArtistImageChange}
      />
    </div>
  );
}

export default ArtistList;
