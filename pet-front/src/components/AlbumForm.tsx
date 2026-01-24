import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import albumFacade from '../services/facades/albumFacade';
import AlbumModal from './AlbumModal';
import type { Album } from '../services/types/artista.types';

function AlbumForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artistaIdFromUrl = searchParams.get('artistaId') ? parseInt(searchParams.get('artistaId')!) : undefined;
  const [album, setAlbum] = useState<Album | null>(null);
  const [artistaId, setArtistaId] = useState<number | undefined>(artistaIdFromUrl);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id && id !== 'novo') {
      loadAlbum();
    } else {
      // Modo criação - artistaId já vem da URL
      setModalVisible(true);
    }
  }, [id]);

  const loadAlbum = async () => {
    if (!id || id === 'novo') return;
    setLoading(true);
    try {
      const albumData = await albumFacade.getAlbum(parseInt(id));
      if (albumData) {
        setAlbum(albumData);
        setArtistaId(albumData.artistaId); // Pega o artistaId do álbum
        setModalVisible(true);
      }
    } catch (err) {
      toast.error('Erro ao carregar álbum');
      navigate('/artista');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    if (artistaId) {
      navigate(`/artista/${artistaId}`);
    } else {
      navigate('/artista');
    }
  };

  const handleClose = () => {
    if (artistaId) {
      navigate(`/artista/${artistaId}`);
    } else {
      navigate('/artista');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center p-5">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <AlbumModal
      visible={modalVisible}
      album={album}
      artistaId={artistaId}
      onHide={handleClose}
      onSuccess={handleSuccess}
    />
  );
}

export default AlbumForm;
