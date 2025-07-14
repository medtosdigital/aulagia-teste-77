import React, { useRef, useState, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface ProfilePhotoCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

// Calcula o maior círculo possível para cobrir adequadamente a imagem
function getCenteredCircleCrop(imageWidth: number, imageHeight: number, containerSize: number = 300): Crop {
  // Calcula o tamanho do crop baseado na imagem redimensionada no container
  const imageAspect = imageWidth / imageHeight;
  let displayWidth, displayHeight;
  
  if (imageAspect > 1) {
    // Imagem é mais larga que alta
    displayWidth = containerSize;
    displayHeight = containerSize / imageAspect;
  } else {
    // Imagem é mais alta que larga
    displayHeight = containerSize;
    displayWidth = containerSize * imageAspect;
  }
  
  // O crop será 85% do menor lado da imagem exibida
  const cropSize = Math.min(displayWidth, displayHeight) * 0.85;
  
  return {
    unit: 'px',
    x: Math.round((displayWidth - cropSize) / 2),
    y: Math.round((displayHeight - cropSize) / 2),
    width: Math.round(cropSize),
    height: Math.round(cropSize),
  };
}

export const ProfilePhotoCropModal: React.FC<ProfilePhotoCropModalProps> = ({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Centraliza o crop ao carregar a imagem
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const initialCrop = getCenteredCircleCrop(naturalWidth, naturalHeight);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop as PixelCrop);
  };

  // Garante que o crop nunca fique undefined
  useEffect(() => {
    if (open && imageSrc && imgRef.current && !crop) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const initialCrop = getCenteredCircleCrop(naturalWidth, naturalHeight);
      setCrop(initialCrop);
      setCompletedCrop(initialCrop as PixelCrop);
    }
    if (!open) {
      setCrop(undefined);
      setCompletedCrop(null);
    }
  }, [open, imageSrc]);

  // Gera o preview do crop em um canvas
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [completedCrop, crop, open]);

  // Ao clicar em salvar, retorna o DataURL do crop
  const handleSave = () => {
    // Se não há crop definido, cria um crop padrão centralizado
    if (!completedCrop && imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const defaultCrop = getCenteredCircleCrop(naturalWidth, naturalHeight);
      setCompletedCrop(defaultCrop as PixelCrop);
      
      // Força a atualização do canvas com o crop padrão
      setTimeout(() => {
        if (previewCanvasRef.current) {
          const dataUrl = previewCanvasRef.current.toDataURL('image/png');
          onCropComplete(dataUrl);
        }
      }, 100);
      return;
    }
    
    if (!previewCanvasRef.current) return;
    const dataUrl = previewCanvasRef.current.toDataURL('image/png');
    onCropComplete(dataUrl);
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs w-full p-4 sm:max-w-md sm:p-6 flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-center w-full">Editar foto do perfil</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 w-full">
          {imageSrc && (
            <div className="w-full flex justify-center">
              <div className="relative overflow-hidden rounded-lg border" style={{ maxWidth: 300, maxHeight: 300, width: '100%' }}>
                <ReactCrop
                  crop={crop}
                  onChange={(c, percentCrop) => {
                    if (!c) return;
                    setCrop(c);
                  }}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Foto para recortar"
                    onLoad={onImageLoad}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </ReactCrop>
              </div>
            </div>
          )}
          <div className="mt-2 w-full flex flex-col items-center">
            <span className="text-xs text-gray-500">Pré-visualização:</span>
            <div className="rounded-full overflow-hidden border mt-1" style={{ width: 80, height: 80 }}>
              <canvas
                ref={previewCanvasRef}
                style={{ width: 80, height: 80, borderRadius: '50%' }}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row gap-2 w-full justify-center mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 py-2 text-base">Cancelar</Button>
          <Button onClick={handleSave} className="flex-1 py-2 text-base">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePhotoCropModal; 