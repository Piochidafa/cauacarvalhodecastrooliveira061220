import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Client } from '@stomp/stompjs';
import artistaFacade from '../services/facades/artistaFacade';
import regionalFacade from '../services/facades/regionalFacade';
import type { CreateAlbumRequest, Artista, Album } from '../services/types/artista.types';
import type { Regional } from '../services/types/regional.types';
import { useParams } from 'react-router-dom';

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
  const [loading, setLoading] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);


  useEffect(() => {
    // Conectar ao WebSocket
    const token = localStorage.getItem('accessToken');
    const client = new Client({
      brokerURL: 'ws://localhost:8083/ws/album',
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      onConnect: () => {
        console.log('Conectado ao STOMP');
        setConnected(true);

        // Inscrever-se em tópicos
        client.subscribe('/topic/album/created', (message) => {
          const response = JSON.parse(message.body);
          console.log('Álbum criado:', response);
          if (response.action === 'CREATE_SUCCESS') {
            toast.success('Álbum criado com sucesso!');
            setLoading(false);
            onSuccess();
            onHide();
          } else if (response.action === 'CREATE_ERROR') {
            toast.error(response.message || 'Erro ao criar álbum');
            setLoading(false);
          }
        });

        client.subscribe('/topic/album/updated', (message) => {
          const response = JSON.parse(message.body);
          console.log('Álbum atualizado:', response);
          if (response.action === 'UPDATE_SUCCESS') {
            toast.success('Álbum atualizado com sucesso!');
            setLoading(false);
            onSuccess();
            onHide();
          } else if (response.action === 'UPDATE_ERROR') {
            toast.error(response.message || 'Erro ao atualizar álbum');
            setLoading(false);
          }
        });

        client.subscribe('/topic/album/cover/uploaded', (message) => {
          const response = JSON.parse(message.body);
          console.log('Capa enviada:', response);
          if (response.action === 'COVER_UPLOAD_SUCCESS') {
            toast.success('Capa enviada com sucesso!');
          } else if (response.action === 'COVER_UPLOAD_ERROR') {
            toast.error(response.message || 'Erro ao enviar capa');
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
      setFormData({
        nome: album.nome,
        artistaId: album.artistaId,
        regionalId: album.regionalId,
      });
    } else {
      setFormData({
        nome: '',
        artistaId: artistaId,
        regionalId: 0
      });
      setFile(null);
    }
  }, [album, visible, artistaId]);

  const loadRegionals = async () => {
    await regionalFacade.loadRegionals(0, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !stompClient.current) {
      toast.error('WebSocket não conectado');
      return;
    }

    setLoading(true);

    try {
      if (album) {
        // Atualizar álbum via WebSocket
        stompClient.current.publish({
          destination: `/app/album/update/${album.id}`,
          body: JSON.stringify(formData)
        });
      } else {
        // Criar álbum via WebSocket
        stompClient.current.publish({
          destination: '/app/album/create',
          body: JSON.stringify(formData)
        });
      }

      // Upload de capa via WebSocket (se houver)
      if (file && album) {
        await uploadCoverViaWebSocket(album.id, file);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar requisição');
      setLoading(false);
    }
  };

  const uploadCoverViaWebSocket = async (albumId: number, file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (stompClient.current && stompClient.current.connected) {
          const base64Data = (reader.result as string).split(',')[1];
          stompClient.current.publish({
            destination: `/app/album/cover/upload/${albumId}`,
            body: JSON.stringify({
              filename: file.name,
              data: base64Data,
              contentType: file.type
            })
          });
          resolve(true);
        } else {
          reject(new Error('WebSocket não conectado'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (event: any) => {
    const files = event.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const footer = (
    <div className="flex gap-2 justify-content-end">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label="Salvar"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={loading}
        disabled={!connected}
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

      <form onSubmit={handleSubmit}>
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

        {/* <div className="field">
          <label htmlFor="artista">Artista *</label>
          <Dropdown
            id="artista"
            value={formData.artistaId}
            onChange={(e) => setFormData({ ...formData, artistaId: e.value })}
            options={artistas}
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecionar artista"
            className="w-full"
            required
            disabled={loading}
          />
        </div> */}

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
            name="capa"
            accept="image/*"
            maxFileSize={10000000}
            onSelect={handleFileSelect}
            auto={false}
            chooseLabel="Escolher arquivo"
            cancelLabel="Cancelar"
            uploadLabel="Upload"
            disabled={loading}
          />
          {file && (
            <small className="text-500">Arquivo selecionado: {file.name}</small>
          )}
        </div>
      </form>
    </Dialog>
  );
}

export default AlbumModal;
