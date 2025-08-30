import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';
import { Image as RNImage } from 'react-native';

export type ImageInput = {
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
};

export type PdfOptions = {
  dpi?: number; // Quality control: 150 (default) or 300 for HD
  title?: string;
  outputName?: string; // without extension
};

const DEFAULT_DPI = 150;

async function ensureDir(dir: string) {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

function points(px: number, dpi: number) {
  // px -> pt conversion using dpi
  return (px / dpi) * 72.0;
}

function extFromUriOrMime(uri: string, mime?: string) {
  if (mime?.includes('png')) return 'png';
  if (mime?.includes('jpg') || mime?.includes('jpeg')) return 'jpg';
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
  return 'jpg';
}

async function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    RNImage.getSize(
      uri,
      (w, h) => resolve({ width: w, height: h }),
      (e) => reject(e)
    );
  });
}

export async function imagesToPdf(images: ImageInput[], opts: PdfOptions = {}): Promise<{ fileUri: string; pageCount: number; fileName: string }>
{
  if (!images.length) {
    throw new Error('No images to export');
  }
  const dpi = opts.dpi || DEFAULT_DPI;

  const pdfDoc = await PDFDocument.create();
  if (opts.title) pdfDoc.setTitle(opts.title);

  for (const img of images) {
    const b64 = await FileSystem.readAsStringAsync(img.uri, { encoding: FileSystem.EncodingType.Base64 });
    const ext = extFromUriOrMime(img.uri, img.mimeType);
    const embed = ext === 'png' ? await pdfDoc.embedPng(b64) : await pdfDoc.embedJpg(b64);
    const size = {
      width: img.width,
      height: img.height,
    };
    if (!size.width || !size.height) {
      try {
        const actual = await getImageSize(img.uri);
        size.width = actual.width;
        size.height = actual.height;
      } catch {
        // fallback to image intrinsic size from pdf-lib
        size.width = embed.width;
        size.height = embed.height;
      }
    }

    const pageWidth = points(size.width!, dpi);
    const pageHeight = points(size.height!, dpi);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(embed, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  const base64 = await pdfDoc.saveAsBase64({ dataUri: false });
  const outDir = FileSystem.documentDirectory + 'Photo2PDF/';
  await ensureDir(outDir);
  const name = (opts.outputName || `export_${Date.now()}`).replace(/\.pdf$/i, '');
  const fileName = `${name}.pdf`;
  const fileUri = `${outDir}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return { fileUri, pageCount: images.length, fileName };
}
