import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Client } from '@stomp/stompjs';
import albumCoverService from '../services/api/albumCoverService';
import regionalFacade from '../services/facades/regionalFacade';
import type { CreateAlbumRequest, Album } from '../services/types/artista.types';
import type { Regional } from '../services/types/regional.types';

interface AlbumModalProps {
  visible: boolean;
  album?: Album | null;
  artistaId?: number;
  onHide: () => void;
  onSuccess: () => void;
}

function AlbumModal({ visible, album, artistaId, onHide, onSuccess }: AlbumModalProps) {
  const [formData, setFormData] = useState<CreateAlbumRequest>({
    nome: '',
    artistaId: artistaId,
    regionalId: 0
  });
  const [regionals, setRegionals] = useState<Regional[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef<File | null>(null);
  const stompClient = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const currentAlbumId = useRef<number | undefined>(album?.id);

  const uploadCoverIfNeeded = async (albumId: number | undefined, replaceExisting: boolean) => {
    const pendingFile = fileRef.current;
    if (!pendingFile) return;
    if (!albumId) {
      toast.error('Não foi possível enviar a capa: álbum sem ID');
      return;
    }

    try {
      setUploadingCover(true);
      if (replaceExisting) {
        const existingCovers = await albumCoverService.getCoversByAlbumId(albumId);
        await Promise.all(existingCovers.map((cover) => albumCoverService.deleteCover(cover.id)));
      }
      await albumCoverService.uploadCover(pendingFile, albumId);
      toast.success('Capa enviada com sucesso!');
      setFile(null);
      setPreviewUrl(null);
      fileRef.current = null;
    } catch (error) {
      console.error('Erro ao enviar capa:', error);
      toast.error('Erro ao enviar capa do álbum');
    } finally {
      setUploadingCover(false);
    }
  };

  useEffect(() => {
    // Conectar ao WebSocket
    const token = localStorage.getItem('accessToken');
    const client = new Client({
      brokerURL: 'ws://localhost:8083/ws/album',
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      debug: () => {},
      onConnect: () => {
        setConnected(true);

        // Inscrever-se em tópicos
        client.subscribe('/topic/album/created', (message) => {
          const response = JSON.parse(message.body);
          if (response.action === 'CREATE_SUCCESS') {
            (async () => {
              await uploadCoverIfNeeded(response?.data?.id, false);
              toast.success('Álbum criado com sucesso!');
              setLoading(false);
              onSuccess();
              onHide();
            })();
          } else if (response.action === 'ERROR') {
            toast.error(response.message || 'Erro ao criar álbum');
            setLoading(false);
          }
        });

        client.subscribe('/topic/album/updated', (message) => {
          const response = JSON.parse(message.body);
          if (response.action === 'UPDATE_SUCCESS') {
            (async () => {
              await uploadCoverIfNeeded(response?.data?.id ?? currentAlbumId.current, true);
              toast.success('Álbum atualizado com sucesso!');
              onSuccess();
              onHide();
              setLoading(false);
            })();
          } else if (response.action === 'ERROR') {
            toast.error(response.message || 'Erro ao atualizar álbum');
            setLoading(false);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Erro STOMP:', frame);
        setConnected(false);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => {
    loadRegionals();
  }, []);

  useEffect(() => {
    const regionalsSubscription = regionalFacade.regionals$.subscribe(setRegionals);
    return () => {
      regionalsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (album) {
      currentAlbumId.current = album.id;
      
      setFormData({
        nome: album.nome,
        artistaId: album.artista.id,
        regionalId: album.regional.id,
      });
    } else {
      currentAlbumId.current = undefined;
      setFormData({
        nome: '',
        artistaId: artistaId,
        regionalId: 0
      });
      setFile(null);
    }
  }, [album, visible, artistaId]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const loadRegionals = async () => {
    await regionalFacade.loadRegionals(0, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome?.trim()) {
      toast.error('Nome do álbum é obrigatório');
      return;
    }

    if (!formData.regionalId) {
      toast.error('Regional é obrigatório');
      return;
    }

    if (!connected || !stompClient.current) {
      toast.error('WebSocket não conectado');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        artistaId: formData.artistaId,
        regionalId: formData.regionalId
      };

      if (currentAlbumId.current) {
        stompClient.current.publish({
          destination: `/app/album/update/${currentAlbumId.current}`,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        stompClient.current.publish({
          destination: '/app/album/create',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
    } catch (error) {
      console.error('Erro ao preparar dados:', error);
      toast.error('Erro ao preparar dados do álbum');
      setLoading(false);
    }
  };

  const handleFileSelect = (event: any) => {
    const files = event.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    } else {
      console.warn('Nenhum arquivo encontrado no event');
    }
  };

  const handleCustomUpload = (event: any) => {
    const files = event.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      toast.success('Arquivo pronto para envio');
    } else if (file) {
      toast.success('Arquivo pronto para envio');
    } else {
      toast.error('Selecione uma imagem antes de enviar');
    }
  };

  const footer = (
    <div className="flex gap-2 justify-content-end">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading || uploadingCover}
      />
      <Button
        label="Salvar"
        icon="pi pi-check"
        type="submit"
        form="album-form"
        loading={loading || uploadingCover}
        disabled={!connected || loading || uploadingCover}
      />
    </div>
  );

  return (
    <Dialog
      header={album ? 'Editar Álbum' : 'Novo Álbum'}
      visible={visible}
      style={{ width: '450px' }}
      onHide={onHide}
      footer={footer}
    >
      {!connected && (
        <div className="flex align-items-center gap-2 mb-3 p-3 bg-yellow-100 border-round">
          <i className="pi pi-exclamation-triangle text-yellow-800"></i>
          <span className="text-yellow-800">Conectando ao servidor...</span>
        </div>
      )}

      <form id="album-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nome">Nome do Álbum *</label>
          <InputText
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="w-full"
            required
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="regional">Regional *</label>
          <Dropdown
            id="regional"
            value={formData.regionalId}
            onChange={(e) => setFormData({ ...formData, regionalId: e.value })}
            options={regionals}
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecionar região"
            className="w-full"
            required
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="capa">Capa do Álbum</label>
          <FileUpload
            mode="advanced"
            name="capa"
            accept="image/*"
            maxFileSize={10000000}
            onSelect={handleFileSelect}
            auto={false}
            chooseLabel="Adicionar imagem"
            uploadLabel="Upload"
            cancelLabel="Remover"
            disabled={loading || uploadingCover}
            customUpload
            uploadHandler={handleCustomUpload}
          />
          {previewUrl && (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="Pré-visualização da capa"
                style={{ maxWidth: '100%', borderRadius: '6px' }}
              />
            </div>
          )}
          {file && (
            <small className="text-500">Arquivo selecionado: {file.name}</small>
          )}
        </div>
      </form>
    </Dialog>
  );
}

export default AlbumModal;
