import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

interface ArtistCreateModalProps {
  visible: boolean;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

function ArtistCreateModal({
  visible,
  value,
  loading,
  onChange,
  onCancel,
  onSave
}: ArtistCreateModalProps) {
  return (
    <div
        style={{
            margin: '10vh'
        }}
    >

    <Dialog
      header="Novo Artista:"
      modal
      draggable={false}
      visible={visible}
      headerStyle={{ padding: '1rem' }}
      style={{
          width: '70vh',
          height: '25vh'
          
        }}
        onHide={() => {
            if (!loading) {
                onCancel();
            }
        }}
        footer={
            <div className="flex gap-2 justify-content-end p-3">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => {
                if (!loading) {
                    onCancel();
                }
            }}
            disabled={loading}
            />
          <Button
            label="Salvar"
            icon="pi pi-check p-1"
            onClick={onSave}
            loading={loading}
            disabled={loading}
            />
        </div>
      }
      >
      <div className="field p-3">
        <label htmlFor="artist-name">Nome do artista:</label>
        <InputText
          id="artist-name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1"
          placeholder="Digite o nome"
          disabled={loading}
          />
      </div>
    </Dialog>
</div>
  );
}

export default ArtistCreateModal;
