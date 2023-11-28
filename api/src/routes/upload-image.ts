import type { RouteHandlerMethod } from 'fastify/types/route';
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

// I love supabase
// Just the returntype of supabase.storage.from().upload() since it's not exported by supabase
type UploadResultPromise = ReturnType<
  ReturnType<ReturnType<typeof createClient>['storage']['from']>['upload']
>;

// Remove Promise<...>
type UploadResult = Awaited<UploadResultPromise>;

type GetFilenameFunc = (width: number, height: number, ext: string) => string;

const genThumbnail =
  (getFilename: GetFilenameFunc, sharpImage: sharp.Sharp) =>
  async ({
    thumbnailType,
    thumbnailSize: [width, height],
  }: ThumbnailOption): Promise<FormattedSharpImage> => {
    const buffer = await sharpImage
      .resize({ width, height, fit: 'inside' })
      .toFormat(thumbnailType)
      .toBuffer();

    return {
      name: getFilename(width, height, thumbnailType),
      contentType: `image/${thumbnailType}`,
      buffer,
    };
  };

type UploadImageResult =
  | {
      success: true;
      name: string;
      data: NonNullable<UploadResult['data']>;
    }
  | {
      success: false;
      name: string;
      error: string;
    };

export const uploadImageHandler: RouteHandlerMethod = async (req, rep) => {
  if (!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY)) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY');
  }

  const processResults: UploadImageResult[] = [];

  const mFilesIter = req.files();
  for await (const mFile of mFilesIter) {
    const baseFileName = (() => {
      const lastDotIndex = mFile.filename.lastIndexOf('.');
      if (lastDotIndex === -1) {
        return mFile.filename;
      }
      return mFile.filename.substring(0, lastDotIndex);
    })();

    const getFilename: GetFilenameFunc = (width, height, ext) =>
      `${baseFileName}_${width}x${height}.${ext}`;

    const imageBuffer = await mFile.toBuffer();
    const sharpImage = sharp(imageBuffer);

    const thumbnails = await Promise.allSettled(
      thumbnailOptions.map(genThumbnail(getFilename, sharpImage)),
    );

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );

    const savePromises = thumbnails
      .filter(
        (result): result is PromiseFulfilledResult<FormattedSharpImage> =>
          result.status === 'fulfilled',
      )
      .map<Promise<[string, UploadResult]>>(
        ({ value: { name, buffer, contentType } }) => {
          return Promise.all([
            Promise.resolve(name),
            supabase.storage.from('images').upload(`gallery/${name}`, buffer, {
              contentType,
            }),
          ]);
        },
      );

    const saveResults = await Promise.allSettled(savePromises);
    processResults.push(
      ...saveResults.map<UploadImageResult>((saveResult) => {
        let error: string;
        let name = '';

        if (saveResult.status === 'fulfilled') {
          const [innerName, { data, error: supabaseError }] = saveResult.value;
          name = innerName;
          if (supabaseError) {
            error = supabaseError.message;
          } else {
            return {
              success: true,
              name,
              // Type inference is wrong here
              // It will never be null because of supabaseError check
              data: data!,
            };
          }
        } else {
          error = saveResult.reason;
        }
        return {
          success: false,
          name,
          error,
        };
      }),
    );
  }

  rep.send({
    ok: processResults.every(({ success }) => success),
    processResults,
  });
};

export default uploadImageHandler;
