import { writeFile, mkdir } from "fs/promises";
import { join as pathJoin } from "path";
import { getDownloadURL } from "firebase-admin/storage";
import { FirebaseAdmin } from "./util/firebase-admin";
import { isFulfilled } from "./util/isFulfilled";
import { getErrorFirstLine } from "./util/getErrorFirstLine";
import contentCollectionsDir, {
  adminFirestoreConverter,
} from "./util/contentCollections";
import type { ContentImage, GalleryPageData } from "../src/types/collections";
import { type ImageURI, parseImageName } from "../src/types/image";
import type { GalleryText } from "../src/types/firestore";

type CombinedImages = Record<string, ContentImage[]>;

async function getImages() {
  const firebaseStorage = FirebaseAdmin.getInstance().storage.bucket(
    FirebaseAdmin.bucketName
  );

  const galleryImageRefs = (
    await firebaseStorage.getFiles({
      prefix: "gallery/",
    })
  )[0]
    // Filter out folders
    .filter((file) => !file.name.endsWith("/"));

  const images = (
    await Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-inferrable-types
      galleryImageRefs.map(async (image) => {
        const imageBaseName = image.name.split("/").pop();

        if (!imageBaseName) {
          // Shouldn't happen
          console.error("Missing image name for some reason: ", image.name);
          return null;
        }

        const parsedName = parseImageName(imageBaseName);
        if (!parsedName) {
          return null;
        }
        const {
          mainImageName,
          size: { x: sizeX, y: sizeY },
          format,
        } = parsedName;

        // Only process the 1920x1080 webp image as the main image
        if (sizeX === 1920 && sizeY === 1080 && format === "webp") {
          const thumbnailName = `${mainImageName}_256x256`;
          const matchedImageJpeg = galleryImageRefs.find((thumbnail) =>
            thumbnail.name.endsWith(`${mainImageName}_1920x1080.webp`)
          );
          const matchedThumbnailWebp = galleryImageRefs.find((thumbnail) =>
            thumbnail.name.endsWith(`${thumbnailName}.webp`)
          );
          const matchedThumbnailJpeg = galleryImageRefs.find((thumbnail) =>
            thumbnail.name.endsWith(`${thumbnailName}.jpeg`)
          );

          if (
            !(matchedImageJpeg && matchedThumbnailWebp && matchedThumbnailJpeg)
          ) {
            // Missing thumbnail
            console.log("Missing images for gallery image: ", image.name);
            return null;
          }

          return Promise.allSettled([
            Promise.allSettled([
              getDownloadURL(image),
              getDownloadURL(matchedImageJpeg),
            ]).then((results) => {
              const webpURI = isFulfilled(results[0]) ? results[0].value : null;
              const jpegURI = isFulfilled(results[1]) ? results[1].value : null;

              if (!(webpURI && jpegURI)) {
                return null;
              }

              const payload: ImageURI = {
                jpeg: jpegURI,
                webp: webpURI,
              };

              return payload;
            }),
            Promise.allSettled([
              getDownloadURL(matchedThumbnailWebp),
              getDownloadURL(matchedThumbnailJpeg),
            ]).then((results) => {
              const webpURI = isFulfilled(results[0]) ? results[0].value : null;
              const jpegURI = isFulfilled(results[1]) ? results[1].value : null;

              if (!(webpURI && jpegURI)) {
                return null;
              }

              const payload: ImageURI = {
                jpeg: jpegURI,
                webp: webpURI,
              };

              return payload;
            }),
          ]).then((results) => {
            const mainImageURI = isFulfilled(results[0])
              ? results[0].value
              : null;
            const thumbnailURI = isFulfilled(results[1])
              ? results[1].value
              : null;

            if (!(mainImageURI && thumbnailURI)) {
              return null;
            }

            const payload: ContentImage = {
              name: mainImageName,
              imagePath: image.name,
              mainURI: mainImageURI, // Both versions are 1920x1080
              thumbnailURI, // Both versions are 256x256
            };

            return payload;
          });
        }

        return null; // Skip images that are not 1920x1080
      })
    )
  )
    .filter(isFulfilled)
    .map((res) => res.value)
    .filter((obj): obj is ContentImage => obj !== null);

  return Promise.resolve(
    images.reduce((accumulator, file) => {
      const imagePathSegments = file.imagePath.split("/"); // Split the path into segments
      if (imagePathSegments.length > 1) {
        const galleryName = imagePathSegments[1]; // Get the folder name after "gallery/"

        if (!galleryName) {
          // Skip if there's no folder name
          return accumulator;
        }

        if (!accumulator[galleryName]) {
          accumulator[galleryName] = []; // Initialize an array for the folder if not exists
        }

        accumulator[galleryName].push(file); // Add the file to the corresponding folder array
      }
      return accumulator;
    }, {} as CombinedImages)
  );
}

async function getText() {
  const firestore = FirebaseAdmin.getInstance().firestore;

  const documents: GalleryText[] = [];
  (
    await firestore
      .collection("gallery")
      .withConverter(adminFirestoreConverter<GalleryText>())
      .where("draft", "==", false)
      .get()
  ).forEach((res) => {
    documents.push(res.data());
  });

  return documents;
}

function matchObjs({
  images,
  texts,
}: {
  images: CombinedImages;
  texts: GalleryText[];
}) {
  const matchedObjects: GalleryPageData[] = texts.map(({ draft: _draft, ...text }) => ({
    ...text,
    images:
      images[text.slug]?.map((image) => ({
        ...image,
        caption: text.images.find((img) => img.imageName === image.name)
          ?.caption,
      })) || [],
  }));

  return matchedObjects;
}

export async function getGallery() {
  const [images, texts, errors] = await Promise.allSettled([
    getImages(),
    getText(),
  ]).then(([imageResult, textResult]) => {
    const images = isFulfilled(imageResult) ? imageResult.value : {};
    const text = isFulfilled(textResult) ? textResult.value : [];
    const errors = [];

    if (!isFulfilled(imageResult)) {
      errors.push([
        "Error fetching images for gallery: ",
        getErrorFirstLine(imageResult.reason),
      ]);
    }

    if (!isFulfilled(textResult)) {
      errors.push([
        "Error fetching text for gallery: ",
        getErrorFirstLine(textResult.reason),
      ]);
    }

    return [images, text, errors] as const;
  });

  const out = matchObjs({ images, texts });

  const mainDir = pathJoin(contentCollectionsDir, "galleries");
  await mkdir(mainDir, { recursive: true });

  for (const gallery of out) {
    const { slug, ...galleryWithoutSlug } = gallery;
    const galleryPath = pathJoin(mainDir, `${slug}.json`);

    await writeFile(galleryPath, JSON.stringify(galleryWithoutSlug, null, 2));
  }

  if (!out.length) {
    // If it is empty, we need to create a dummy file to avoid build errors
    const galleryPath = pathJoin(mainDir, `DUMMY.json`);
    const dummyGallery: GalleryPageData = {
      images: [],
      slug: "",
      galleryName: "",
    };

    await writeFile(galleryPath, JSON.stringify(dummyGallery, null, 2));
  }

  if (errors.length) {
    return Promise.reject(errors);
  }

  return Promise.resolve();
}
