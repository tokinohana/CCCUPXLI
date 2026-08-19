import { useState } from "react";
import { toast } from "sonner";

import { GlyphCheckStone } from "@/components/glyphs";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { openCloudinaryWidget } from "@/lib/cloudinary";
import { TEAM_FILE_TYPES } from "@/lib/types";

function formatsFromAccept(accept) {
  if (!accept) return undefined;
  return accept
    .split(",")
    .map((part) => part.trim().replace(/^\./, "").toLowerCase())
    .filter(Boolean);
}

export function FileChecklist({ files, status, frozen, onChanged }) {
  const [busyKey, setBusyKey] = useState(null);

  const upload = (fileType, allowedFormats) => {
    openCloudinaryWidget({ allowedFormats }, async (info) => {
      setBusyKey(fileType);
      try {
        await endpoints.uploadFile(fileType, {
          url: info.secure_url,
          public_id: info.public_id,
          format: info.format,
        });
        await onChanged();
        toast.success("Berkas tersimpan.");
      } catch (caught) {
        toast.error(caught instanceof ApiError ? caught.message : "Berkas gagal diunggah.");
      } finally {
        setBusyKey(null);
      }
    });
  };

  const remove = async (fileType) => {
    setBusyKey(fileType);
    try {
      await endpoints.deleteFile(fileType);
      await onChanged();
      toast.success("Berkas dihapus.");
    } catch (caught) {
      toast.error(caught instanceof ApiError ? caught.message : "Berkas gagal dihapus.");
    } finally {
      setBusyKey(null);
    }
  };

  // Hide 'pembayaran' unless status is PENDINGTF
  const visibleFileTypes = TEAM_FILE_TYPES.filter((type) => {
    if (type.key === "pembayaran") {
      return status === "PENDINGTF";
    }
    return true;
  });

  return (
    <ul className="space-y-4">
      {visibleFileTypes.map((type) => {
        const existing = files.find((file) => file.file_type === type.key);
        // Allow uploading payment proof specifically during PENDINGTF status even if overall form is frozen
        const isItemFrozen = type.key === "pembayaran" && status === "PENDINGTF" ? false : frozen;

        return (
          <li key={type.key} className="border-2 border-foreground p-4">
            <div className="flex items-start gap-3">
              <GlyphCheckStone
                className={existing ? "h-6 w-6 shrink-0 text-primary" : "h-6 w-6 shrink-0 text-muted"}
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg uppercase">{type.label}</p>
                <p className="text-sm text-muted-foreground">Format: {type.hint}</p>

                {type.templates?.length ? (
                  <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-3">
                    {type.templates.map((template) => (
                      <a
                        key={template.url}
                        href={template.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
                      >
                        {template.label} ↗
                      </a>
                    ))}
                  </div>
                ) : null}

                {existing ? (
                  <p className="mt-1 text-sm font-semibold text-primary">Sudah diunggah</p>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-destructive">Belum diunggah</p>
                )}
              </div>
            </div>

            {!isItemFrozen ? (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busyKey === type.key}
                  onClick={() => upload(type.key, formatsFromAccept(type.accept))}
                >
                  {busyKey === type.key ? "Mengunggah..." : existing ? "Ganti berkas" : "Unggah berkas"}
                </Button>
                {existing ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={busyKey === type.key}
                    onClick={() => void remove(type.key)}
                  >
                    Hapus
                  </Button>
                ) : null}
              </div>
            ) : null}

            {existing?.url ? (
              <a
                href={existing.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-semibold underline underline-offset-4"
              >
                Lihat berkas
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}