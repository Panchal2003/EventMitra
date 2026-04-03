import { useEffect, useMemo, useState } from "react";
import { Crop, RotateCcw, ZoomIn } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

const OUTPUT_SIZE = 320;
const PREVIEW_SIZE = 260;

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function buildCroppedAvatar(source, zoom, offsetX, offsetY) {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  const baseScale = Math.max(OUTPUT_SIZE / image.width, OUTPUT_SIZE / image.height);
  const finalScale = baseScale * zoom;
  const drawWidth = image.width * finalScale;
  const drawHeight = image.height * finalScale;
  const drawX = (OUTPUT_SIZE - drawWidth) / 2 + offsetX;
  const drawY = (OUTPUT_SIZE - drawHeight) / 2 + offsetY;

  context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  return canvas.toDataURL("image/jpeg", 0.9);
}

export function AvatarCropModal({ busy = false, onApply, onClose, open, source }) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [previewSize, setPreviewSize] = useState({ width: 1, height: 1 });

  useEffect(() => {
    if (open) {
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    }
  }, [open, source]);

  const imageStyle = useMemo(() => {
    const ratio = PREVIEW_SIZE / OUTPUT_SIZE;
    const baseScale = Math.max(PREVIEW_SIZE / previewSize.width, PREVIEW_SIZE / previewSize.height);
    const finalScale = baseScale * zoom;
    const width = previewSize.width * finalScale;
    const height = previewSize.height * finalScale;

    return {
      width,
      height,
      left: (PREVIEW_SIZE - width) / 2 + offsetX * ratio,
      top: (PREVIEW_SIZE - height) / 2 + offsetY * ratio,
    };
  }, [offsetX, offsetY, previewSize.height, previewSize.width, zoom]);

  const handleApply = async () => {
    const croppedAvatar = await buildCroppedAvatar(source, zoom, offsetX, offsetY);
    onApply(croppedAvatar);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crop profile image"
      description="Adjust zoom and position, then save the square crop for your profile."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => {
            setZoom(1);
            setOffsetX(0);
            setOffsetY(0);
          }}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="success" isLoading={busy} onClick={handleApply}>
            Save Image
          </Button>
        </div>
      }
    >
      {source ? (
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="relative h-[260px] w-[260px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-inner">
              <img
                src={source}
                alt="Crop preview"
                onLoad={(event) =>
                  setPreviewSize({
                    width: event.currentTarget.naturalWidth || 1,
                    height: event.currentTarget.naturalHeight || 1,
                  })
                }
                className="absolute max-w-none"
                style={imageStyle}
              />
              <div className="pointer-events-none absolute inset-[18px] rounded-full border-2 border-white shadow-[0_0_0_999px_rgba(255,255,255,0.72)]" />
            </div>
          </div>

          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ZoomIn className="h-4 w-4 text-primary-600" />
                Zoom
              </span>
              <input
                type="range"
                min="1"
                max="2.8"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full accent-primary-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Crop className="h-4 w-4 text-primary-600" />
                Horizontal Position
              </span>
              <input
                type="range"
                min="-120"
                max="120"
                step="1"
                value={offsetX}
                onChange={(event) => setOffsetX(Number(event.target.value))}
                className="w-full accent-primary-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Crop className="h-4 w-4 text-primary-600" />
                Vertical Position
              </span>
              <input
                type="range"
                min="-120"
                max="120"
                step="1"
                value={offsetY}
                onChange={(event) => setOffsetY(Number(event.target.value))}
                className="w-full accent-primary-600"
              />
            </label>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
