export interface Image {
  name: ImageName | string;
  /**
   * It's path in Firebase Storage
   * Not very useful
   */
  imagePath?: string;
  mainURI: ImageURI | string;
  thumbnailURI: ImageURI | string;
  caption?: string;
}

export interface ImageName {
  /**
   * The name of the image (original file name without extension)
   */
  mainImageName: string;
  format: string;
  size: {
    x: number;
    y: number;
  };
}

export interface ImageURI {
  jpeg: string;
  webp: string;
}

/**
 * For identifying image name parts
 * Filename format: {mainImageName}_{sizeX}x{sizeY}.{format}
 */
export const imageNameRegex = /^(.+)_(\d+)x(\d+)\.(.+)$/;

/**
 * Parses the given image name and returns an object containing the main image name,
 * format, and size.
 *
 * Filename format: {mainImageName}_{sizeX}x{sizeY}.{format}
 *
 * @param {string} name - The image name to be parsed.
 * @return {ImageName | null} - An object containing the main image name, format, and size,
 * or null if the image name does not match the required format.
 */
export const parseImageName = (name: string): ImageName | null => {
  const regexResult = name.match(imageNameRegex);

  if (!regexResult) {
    return null;
  }

  const [, mainImageName, width, height, format] = regexResult;

  return {
    mainImageName,
    format,
    size: {
      x: Number(width),
      y: Number(height),
    },
  };
};

/**
 * Checks if the given name is an instance of ImageName.
 *
 * @param {ImageName | string} name - The name to be checked.
 * @return {boolean} Retruns true if the name is an instance of ImageName, false otherwise.
 */
export const isImageName = (name: ImageName | string): name is ImageName => {
  return typeof name !== 'string';
};

export const isThumbnail = (name: ImageName) =>
  name.size.x === 256 && name.size.y === 256;
