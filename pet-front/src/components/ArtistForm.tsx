import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import artistaFacade from '../services/facades/artistaFacade';
import type { CreateArtistaRequest } from '../services/types/artista.types';

function ArtistForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateArtistaRequest>({ nome: '' });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id && id !== 'novo') {
      loadArtista();
    }
  }, [id]);

  const loadArtista = async () => {
    if (!id || id === 'novo') return;
    setLoading(true);
    try {
      const artista = await artistaFacade.getArtista(parseInt(id));
      if (artista) {
        setFormData({ nome: artista.nome });
        setCurrentImageUrl(artista.imageUrl || null);
      }
    } catch (err) {
      toast.error('Erro ao carregar artista');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedArtistaId: number | null = null;
      if (id && id !== 'novo') {
        const updated = await artistaFacade.updateArtista(parseInt(id), formData);
        savedArtistaId = updated?.id ?? parseInt(id);
        toast.success('Artista atualizado com sucesso!');
      } else {
        const created = await artistaFacade.createArtista(formData);
        savedArtistaId = created?.id ?? null;
        toast.success('Artista criado com sucesso!');
      }

      if (imageFile && savedArtistaId) {
        const uploaded = await artistaFacade.uploadArtistaImage(savedArtistaId, imageFile);
        if (uploaded) {
          toast.success('Imagem do artista enviada com sucesso!');
          setCurrentImageUrl(uploaded.imageUrl || null);
          setImageFile(null);
          setPreviewUrl(null);
        }
      }
      navigate('/artista');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar artista');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveImage = async () => {
    if (!id || id === 'novo') {
      setImageFile(null);
      setPreviewUrl(null);
      setCurrentImageUrl(null);
      return;
    }

    try {
      const updated = await artistaFacade.removeArtistaImage(parseInt(id));
      if (updated) {
        toast.success('Imagem removida com sucesso!');
      }
      setImageFile(null);
      setPreviewUrl(null);
      setCurrentImageUrl(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover imagem');
    }
  };

  return (
    <div className="p-4 flex justify-content-center">
      <Card title={id === 'novo' ? 'Novo Artista' : 'Editar Artista'} style={{ width: '400px' }}>
        {loading && <ProgressSpinner />}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <InputText
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="imagem">Imagem (opcional)</label>
            <input
              id="imagem"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {(previewUrl || currentImageUrl) && (
              <div className="pt-2">
                <img
                  src={previewUrl || currentImageUrl || ''}
                  alt="Pré-visualização do artista"
                  style={{ width: '100%', borderRadius: '6px' }}
                />
                <div className="pt-2">
                  <Button
                    type="button"
                    label="Remover imagem"
                    className="p-button-danger"
                    onClick={handleRemoveImage}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-3">
            <Button
              label="Salvar"
              type="submit"
              loading={loading}
            />
            <Button
              label="Cancelar"
              type="button"
              onClick={() => navigate('/artista')}
              className="p-button-secondary"
            />
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ArtistForm;
