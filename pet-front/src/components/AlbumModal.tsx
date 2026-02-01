import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Client } from '@stomp/stompjs';
import { motion } from 'motion/react';
import albumCoverService from '../services/api/albumCoverService';
import regionalFacade from '../services/facades/regionalFacade';
import type { CreateAlbumRequest, Album, AlbumCover } from '../services/types/artista.types';
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
  const normalizedRegionals = regionals.map((regional) => ({
    ...regional,
    id: Number(regional.id)
  }));
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingCovers, setExistingCovers] = useState<AlbumCover[]>([]);
  const [removingCoverId, setRemovingCoverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef<File[]>([]);
  const stompClient = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const currentAlbumId = useRef<number | undefined>(album?.id);
  const isEditing = Boolean(album?.id);

  const uploadCoverIfNeeded = async (albumId: number | undefined, replaceExisting: boolean) => {
    const pendingFiles = fileRef.current;
    if (!pendingFiles || pendingFiles.length === 0) return;
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
      await albumCoverService.uploadCovers(pendingFiles, albumId);
      toast.success('Capa(s) enviada(s) com sucesso!');
      setFiles([]);
      setPreviewUrls([]);
      fileRef.current = [];
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
              await uploadCoverIfNeeded(response?.data?.id ?? currentAlbumId.current, false);
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
    fileRef.current = files;
  }, [files]);

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

      const resolvedArtistaIdRaw = album.artista?.id ?? (album as any).artistaId ?? artistaId;
      const resolvedRegionalIdRaw = album.regional?.id ?? (album as any).regionalId ?? 0;
      const resolvedArtistaId = resolvedArtistaIdRaw ? Number(resolvedArtistaIdRaw) : undefined;
      const resolvedRegionalId = resolvedRegionalIdRaw ? Number(resolvedRegionalIdRaw) : 0;

      setFormData({
        nome: album.nome,
        artistaId: resolvedArtistaId,
        regionalId: Number.isFinite(resolvedRegionalId) ? resolvedRegionalId : 0,
      });
    } else {
      currentAlbumId.current = undefined;
      setFormData({
        nome: '',
        artistaId: artistaId,
        regionalId: 0
      });
      setFiles([]);
      setPreviewUrls([]);
    }
  }, [album, visible, artistaId]);

  useEffect(() => {
    if (!album?.id) {
      setExistingCovers([]);
      return;
    }
    const loadCovers = async () => {
      try {
        const covers = await albumCoverService.getCoversByAlbumId(album.id);
        setExistingCovers(covers);
      } catch (error) {
        console.error('Erro ao carregar capas:', error);
        setExistingCovers([]);
      }
    };
    void loadCovers();
  }, [album?.id]);

  const handleRemoveCover = async (coverId: number) => {
    try {
      setRemovingCoverId(coverId);
      await albumCoverService.deleteCover(coverId);
      setExistingCovers((covers) => covers.filter((cover) => cover.id !== coverId));
      toast.success('Capa removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover capa:', error);
      toast.error('Erro ao remover capa');
    } finally {
      setRemovingCoverId(null);
    }
  };

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

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
      setFiles(files);
    } else {
      console.warn('Nenhum arquivo encontrado no event');
    }
  };

  const handleCustomUpload = (event: any) => {
    const files = event.files;
    if (files && files.length > 0) {
      setFiles(files);
      toast.success('Arquivo pronto para envio');
    } else if (fileRef.current.length > 0) {
      toast.success('Arquivo pronto para envio');
    } else {
      toast.error('Selecione uma imagem antes de enviar');
    }
  };

  const footer = (
    <div className="flex gap-2 justify-content-end p-3 ">
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          onClick={onHide}
          className="p-button-text p-1 gap-1"
          disabled={loading || uploadingCover}
        />
      </motion.div>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Button
          label="Salvar"
          className='p-1 gap-1'
          icon="pi pi-check"
          type="submit"
          form="album-form"
          loading={loading || uploadingCover}
          disabled={!connected || loading || uploadingCover}
        />
      </motion.div>
    </div>
  );

  return (
    <Dialog
      header={album ? 'Editar Álbum' : 'Novo Álbum'}
      modal
      draggable={false}
      visible={visible}
      style={{ width: '60vw', maxWidth: '92vw' }}
      headerStyle={{ padding: '1.25rem 1.25rem 0.75rem' }}
      contentStyle={{ padding: 0 }}
      onHide={onHide}
      footer={footer}
    >
      <div className="p-4 pt-3">
      <motion.div
        className="flex align-items-center justify-content-between mb-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div>
          <h3 className="m-0 text-lg">
            {isEditing ? 'Edite os dados do album' : 'Crie um novo album'}
          </h3>
          <small className="text-500">Campos obrigatorios marcados com *</small>
        </div>
        {isEditing && (
          <span className="text-xs text-green-700 bg-green-100 border-round px-2 py-1">
            Editando
          </span>
        )}
      </motion.div>

      {!connected && (
        <motion.div
          className="flex align-items-center gap-2 mb-3 p-3 bg-yellow-100 border-round"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <i className="pi pi-exclamation-triangle text-yellow-800"></i>
          <span className="text-yellow-800">Conectando ao servidor...</span>
        </motion.div>
      )}

      <motion.form
        id="album-form"
        className="p-fluid"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div className="field">
          <label htmlFor="nome">Nome do Álbum *</label>
            <InputText
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full p-1"
              placeholder="Ex: Nome do album"
              required
              disabled={loading}
            />
        </div>

        <div className="field">
          <label htmlFor="regional">Regional *</label>
          <Dropdown
            id="regional"
            value={formData.regionalId ? Number(formData.regionalId) : null}
            onChange={(e) => setFormData({ ...formData, regionalId: e.value })}
            options={normalizedRegionals}
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecionar região"
            className="w-full p-1"
            required
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="capa">Capa do Álbum</label>
          <FileUpload
            mode="basic"
            className='gap-1 p-1'
            name="capa"
            headerStyle={{
              color: 'gray',
              height: '20rem'
            }}
            accept="image/*"
            maxFileSize={10000000}
            onSelect={handleFileSelect}
            auto={false}
            chooseLabel="Adicionar imagens"
            uploadLabel="Upload"
            cancelLabel="Remover"
            disabled={loading || uploadingCover}
            customUpload
            uploadHandler={handleCustomUpload}
            multiple
          />
          {existingCovers.length > 0 && (
            <div className="mt-3">
              <small className="font-md">Capas atuais:</small>
              <div className="grid mt-2">
                {existingCovers.map((cover) => (
                  <div key={cover.id} className="col-3">
                    {cover.url ? (
                      <div className="relative">
                        <img
                          src={cover.url}
                          alt="Capa atual"
                          className="border-2"
                          style={{ width: '100%', height: '16rem', objectFit: 'cover', borderRadius: '3vh' }}
                        />
                        <Button
                          icon="pi pi-trash"
                          className="p-button-danger p-button-rounded p-button-sm"
                          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                          onClick={() => void handleRemoveCover(cover.id)}
                          loading={removingCoverId === cover.id}
                          disabled={removingCoverId === cover.id}
                        />
                      </div>
                    ) : (
                      <div className="surface-100 border-round p-3 text-500 text-sm">
                        Capa sem pré-visualização
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {previewUrls.length > 0 && (
            <div className="mt-3">
              <small className="text-500">Novas capas:</small>
              <div className="grid mt-2">
                {previewUrls.map((previewUrl, index) => (
                  <div key={`${previewUrl}-${index}`} className="col-3">
                    <img
                      src={previewUrl}
                      alt="Pré-visualização da capa"
                      style={{ width: '100%', height: '12rem', objectFit: 'cover', borderRadius: '6px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {files.length > 0 && (
            <small className="text-500">
              Arquivos selecionados: {files.map((file) => file.name).join(', ')}
            </small>
          )}
        </div>
      </motion.form>
      </div>
    </Dialog>
  );
}

export default AlbumModal;
