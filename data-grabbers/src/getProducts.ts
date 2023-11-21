import { writeFile, mkdir } from "fs/promises";
import { join as pathJoin } from "path";
import { getDownloadURL } from "firebase-admin/storage";
import { FirebaseAdmin } from "./util/firebase-admin";
import { isFulfilled } from "./util/isFulfilled";
import { getErrorFirstLine } from "./util/getErrorFirstLine";
import type { ContentImage, ProductPageData } from "../src/types/collections";
import { type ImageURI, parseImageName } from "../src/types/image";
import type { ProductText } from "../src/types/firestore";
import contentCollectionsDir, {
  adminFirestoreConverter,
} from "./util/contentCollections";

type CombinedImages = Record<string, ContentImage[]>;

async function getImages() {
  const firebaseStorage = FirebaseAdmin.getInstance().storage.bucket(
    FirebaseAdmin.bucketName
  );

  const productImageRefs = (
    await firebaseStorage.getFiles({
      prefix: "products/",
    })
  )[0]
    // Filter out folders
    .filter((file) => !file.name.endsWith("/"));

  const images = (
    await Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-inferrable-types
      productImageRefs.map(async (image) => {
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
          const matchedImageJpeg = productImageRefs.find((thumbnail) =>
            thumbnail.name.endsWith(`${mainImageName}_1920x1080.webp`)
          );
          const matchedThumbnailWebp = productImageRefs.find((thumbnail) =>
            thumbnail.name.endsWith(`${thumbnailName}.webp`)
          );
          const matchedThumbnailJpeg = productImageRefs.find((thumbnail) =>
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
        const productSlug = imagePathSegments[1]; // Get the folder name after "products/"

        if (!productSlug) {
          // Skip if there's no folder name
          return accumulator;
        }

        if (!accumulator[productSlug]) {
          accumulator[productSlug] = []; // Initialize an array for the folder if not exists
        }

        accumulator[productSlug].push(file); // Add the file to the corresponding folder array
      }
      return accumulator;
    }, {} as CombinedImages)
  );
}

async function getText() {
  const firestore = FirebaseAdmin.getInstance().firestore;

  const documents: ProductText[] = [];
  (
    await firestore
      .collection("products")
      .withConverter(adminFirestoreConverter<ProductText>())
      .where("draft", "==", false)
      .get()
  ).forEach((res) => {
    documents.push(res.data() as ProductText);
  });

  return documents;
}

function matchObjs({
  images,
  texts,
}: {
  images: CombinedImages;
  texts: ProductText[];
}) {
  const matchedObjects: ProductPageData[] = texts.map(
    ({ draft: _draft, ...text }) => ({
      ...text,
      images:
        images[text.slug]?.map((image) => ({
          ...image,
          caption: text.images.find((img) => img.imageName === image.name)
            ?.caption,
        })) || [],
    })
  );

  return matchedObjects;
}

export async function getProducts() {
  const [images, texts, errors] = await Promise.allSettled([
    getImages(),
    getText(),
  ]).then(([imageResult, textResult]) => {
    const images = isFulfilled(imageResult) ? imageResult.value : {};
    const texts = isFulfilled(textResult) ? textResult.value : [];
    const errors = [];

    if (!isFulfilled(imageResult)) {
      errors.push([
        "Error fetching images for products: ",
        getErrorFirstLine(imageResult.reason),
      ]);
    }

    if (!isFulfilled(textResult)) {
      errors.push([
        "Error fetching text for products: ",
        getErrorFirstLine(textResult.reason),
      ]);
    }

    return [images, texts, errors] as const;
  });

  const out = matchObjs({ images, texts });

  const mainDir = pathJoin(contentCollectionsDir, "products");
  await mkdir(mainDir, { recursive: true });

  for (const product of out) {
    const { slug, ...productWithoutSlug } = product;
    const productPath = pathJoin(mainDir, `${slug}.json`);

    await writeFile(productPath, JSON.stringify(productWithoutSlug, null, 2));
  }

  if (!out.length) {
    // If it is empty, we need to create a dummy file to avoid build errors
    const productPath = pathJoin(mainDir, `DUMMY.json`);
    const dummyProduct: ProductPageData = {
      images: [],
      slug: "",
      title: "",
      description: "",
    };

    await writeFile(productPath, JSON.stringify(dummyProduct, null, 2));
  }

  if (errors.length) {
    return Promise.reject(errors);
  }

  return Promise.resolve();
}
