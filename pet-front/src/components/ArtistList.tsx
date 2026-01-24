import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import artistaFacade from '../services/facades/artistaFacade';
import type { Artista } from '../services/types/artista.types';

function ArtistList() {
  const navigate = useNavigate();
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

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
    const artistasSubscription = artistaFacade.artistas$.subscribe(setArtistas);
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
          className="p-button-success"
        />
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <Card title="Artistas">
        {loading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <>
            <div className="mb-3">{header}</div>
            <div className="grid">
              {artistas.map((artista) => (
                <div key={artista.id} className="col-12 md:col-6 lg:col-4 xl:col-3">
                  <Card
                    className="cursor-pointer hover:surface-100 transition-duration-200"
                    onClick={() => handleRowClick(artista)}
                  >
                    <div className="flex flex-column gap-2">
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-4xl text-primary"></i>
                        <div className="flex flex-column">
                          <span className="font-bold text-lg">{artista.nome}</span>
                          <span className="text-sm text-500">ID: {artista.id}</span>
                        </div>
                      </div>
                      <div className="flex align-items-center gap-2 mt-2">
                        <i className="pi pi-calendar text-primary"></i>
                        <span className="text-sm">{artista.createdAt}</span>
                      </div>
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-music text-primary"></i>
                        <span className="text-sm font-semibold">
                          {artista.quantidadeAlbuns || 0} {artista.quantidadeAlbuns === 1 ? 'álbum' : 'álbuns'}
                        </span>
                      </div>
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
          </>
        )}
      </Card>
    </div>
  );
}

export default ArtistList;
