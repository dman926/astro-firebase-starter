import type { RouteHandlerMethod } from 'fastify/types/route';
import type { MultipartFile } from '@fastify/multipart';
import sharp, { type FormatEnum } from 'sharp';
import { createClient } from '@supabase/supabase-js';

const THUMBNAIL_TYPES = ['webp', 'jpeg'] as ReadonlyArray<keyof FormatEnum>;
const THUMBNAIL_SIZES = [
  [1920, 1080],
  [256, 256],
] as ReadonlyArray<readonly [number, number]>;

interface ThumbnailOption {
  thumbnailType: (typeof THUMBNAIL_TYPES)[number];
  thumbnailSize: (typeof THUMBNAIL_SIZES)[number];
}

const thumbnailOptions: ThumbnailOption[] = [];

for (const thumbnailType of THUMBNAIL_TYPES) {
  for (const thumbnailSize of THUMBNAIL_SIZES) {
    thumbnailOptions.push({ thumbnailType, thumbnailSize });
  }
}

interface FormattedSharpImage {
  name: string;
  contentType: string;
  buffer: Buffer;
}

export const uploadImageHandler: RouteHandlerMethod = async (req, rep) => {
  if (!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY)) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY');
  }

  // Extract uploaded files
  const files: MultipartFile[] = [];
  const filesIter = req.files();
  for await (const file of filesIter) {
    if (!file) {
      continue;
    }
    files.push(file);
  }

  const processPromises = files.map<Promise<FormattedSharpImage[]>>((file) => {
    const baseFileName = (() => {
      const lastDotIndex = file.filename.lastIndexOf('.');
      if (lastDotIndex === -1) {
        return file.filename;
      }
      return file.filename.substring(0, lastDotIndex);
    })();

    const getFilename = (width: number, height: number, ext: string) =>
      `${baseFileName}_${width}x${height}.${ext}`;

    return file
      .toBuffer()
      .then((buffer) => sharp(buffer))
      .then((sharpImage) =>
        Promise.all(
          thumbnailOptions.map(
            async ({ thumbnailType, thumbnailSize: [width, height] }) => {
              const buffer = await sharpImage
                .resize({ width, height, fit: 'inside' })
                .toFormat(thumbnailType)
                .toBuffer();

              return {
                name: getFilename(width, height, thumbnailType),
                contentType: `image/${thumbnailType}`,
                buffer,
              };
            },
          ),
        ),
      );
  });

  const thumbnails = await Promise.allSettled(processPromises);

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
  );

  const savePromises = thumbnails
    .filter(
      (result): result is PromiseFulfilledResult<FormattedSharpImage[]> =>
        result.status === 'fulfilled',
    )
    .map((thumbnailGroup) => {
      return thumbnailGroup.value.map(({ name, buffer, contentType }) => {
        return supabase.storage
          .from('images')
          .upload(`gallery/${name}`, buffer, {
            contentType,
          });
      });
    });

  await Promise.allSettled(savePromises);

  rep.send({ ok: true, x: req.headers });
};

export default uploadImageHandler;
