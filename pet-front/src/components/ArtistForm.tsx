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
      if (id && id !== 'novo') {
        await artistaFacade.updateArtista(parseInt(id), formData);
        toast.success('Artista atualizado com sucesso!');
      } else {
        await artistaFacade.createArtista(formData);
        toast.success('Artista criado com sucesso!');
      }
      navigate('/artista');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar artista');
    } finally {
      setLoading(false);
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
