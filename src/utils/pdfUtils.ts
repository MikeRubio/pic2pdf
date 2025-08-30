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

export type FitMode = 'contain' | 'cover' | 'stretch';
export type PaperPreset = 'auto' | 'A4' | 'Letter' | 'Legal';
export type Orientation = 'auto' | 'portrait' | 'landscape';

export type PdfOptions = {
  dpi?: number; // Quality control: 150 (default) or 300 for HD
  title?: string;
  outputName?: string; // without extension
  paper?: PaperPreset; // default 'auto' (image-sized pages)
  orientation?: Orientation; // default 'auto'
  marginsMm?: number | { top: number; right: number; bottom: number; left: number }; // default 10
  fit?: FitMode; // default 'contain'
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

function mmToPt(mm: number) {
  return (mm / 25.4) * 72.0;
}

function inToPt(inches: number) {
  return inches * 72.0;
}

function getMarginsPts(marginsMm?: PdfOptions['marginsMm']) {
  const m = marginsMm ?? 10;
  const obj = typeof m === 'number' ? { top: m, right: m, bottom: m, left: m } : m;
  return {
    top: mmToPt(obj.top),
    right: mmToPt(obj.right),
    bottom: mmToPt(obj.bottom),
    left: mmToPt(obj.left),
  };
}

function getPaperSizePts(paper: PaperPreset, orientation: Orientation): [number, number] | null {
  let w = 0, h = 0;
  if (paper === 'A4') { w = mmToPt(210); h = mmToPt(297); }
  else if (paper === 'Letter') { w = inToPt(8.5); h = inToPt(11); }
  else if (paper === 'Legal') { w = inToPt(8.5); h = inToPt(14); }
  else return null;
  if (orientation === 'landscape') return [h, w];
  if (orientation === 'portrait' || orientation === 'auto') return [w, h];
  return [w, h];
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

    const paper = opts.paper ?? 'auto';
    const orientation = opts.orientation ?? 'auto';
    const margins = getMarginsPts(opts.marginsMm);
    const fit: FitMode = opts.fit ?? 'contain';

    // Determine page size in points
    let pageWidth: number;
    let pageHeight: number;
    const autoPts: [number, number] = [points(size.width!, dpi), points(size.height!, dpi)];
    if (paper === 'auto') {
      pageWidth = autoPts[0];
      pageHeight = autoPts[1];
      if (orientation === 'landscape' && pageHeight > pageWidth) {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
      } else if (orientation === 'portrait' && pageWidth > pageHeight) {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
      }
    } else {
      const preset = getPaperSizePts(paper, orientation);
      [pageWidth, pageHeight] = preset!;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const contentW = Math.max(0, pageWidth - margins.left - margins.right);
    const contentH = Math.max(0, pageHeight - margins.top - margins.bottom);

    // target draw size
    const imgRatio = (embed.width / embed.height);
    const boxRatio = contentW / contentH;
    let drawW = contentW;
    let drawH = contentH;
    if (fit === 'contain') {
      if (imgRatio > boxRatio) {
        drawW = contentW;
        drawH = contentW / imgRatio;
      } else {
        drawH = contentH;
        drawW = contentH * imgRatio;
      }
    } else if (fit === 'cover') {
      if (imgRatio < boxRatio) {
        drawW = contentW;
        drawH = contentW / imgRatio;
      } else {
        drawH = contentH;
        drawW = contentH * imgRatio;
      }
    } else if (fit === 'stretch') {
      drawW = contentW;
      drawH = contentH;
    }

    const x = margins.left + (contentW - drawW) / 2;
    const y = margins.bottom + (contentH - drawH) / 2;

    page.drawImage(embed, {
      x,
      y,
      width: drawW,
      height: drawH,
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
