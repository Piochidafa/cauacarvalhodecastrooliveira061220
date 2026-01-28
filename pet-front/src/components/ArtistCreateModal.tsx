import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { motion } from 'motion/react';

interface ArtistCreateModalProps {
  visible: boolean;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  imagePreviewUrl?: string | null;
  currentImageUrl?: string | null;
  onImageChange?: (file: File | null) => void;
  onRemoveImage?: () => void;
  title?: string;
  saveLabel?: string;
}

function ArtistCreateModal({
  visible,
  value,
  loading,
  onChange,
  onCancel,
  onSave,
  imagePreviewUrl,
  currentImageUrl,
  onImageChange,
  onRemoveImage,
  title = 'Novo Artista:',
  saveLabel = 'Salvar'
}: ArtistCreateModalProps) {
  const imageUrlToShow = imagePreviewUrl || currentImageUrl || null;

  return (
    <div
    >

    <Dialog
      header={title}
      modal
      draggable={false}
      visible={visible}
      headerStyle={{ padding: '1rem' }}
      style={{
          width: '70vh',
          height: 'auto'
          
        }}
        onHide={() => {
            if (!loading) {
                onCancel();
            }
        }}
        footer={
            <div className="flex gap-2 justify-content-end p-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
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
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              label={saveLabel}
              icon="pi pi-check p-1"
              onClick={onSave}
              loading={loading}
              disabled={loading}
              />
          </motion.div>
        </div>
      }
      >
      <motion.div
        className="field p-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <label htmlFor="artist-name">Nome do artista:</label>
        <InputText
          id="artist-name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1"
          placeholder="Digite o nome"
          disabled={loading}
          />
      </motion.div>

      <motion.div
        className="field px-3 pb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.25 }}
      >
        <label htmlFor="artist-image">Imagem (opcional):</label>
        <input
          id="artist-image"
          type="file"
          accept="image/*"
          className="w-full p-1"
          disabled={loading}
          onChange={(e) => onImageChange?.(e.target.files?.[0] || null)}
        />
        {imageUrlToShow && (
          <motion.div
            className="pt-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={imageUrlToShow}
              alt="Pré-visualização do artista"
              style={{ width: '100%', borderRadius: '6px' }}
            />
            {onRemoveImage && (
              <div className="pt-2">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    label="Remover imagem"
                    className="p-button-danger"
                    onClick={onRemoveImage}
                    disabled={loading}
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </Dialog>
</div>
  );
}

export default ArtistCreateModal;
