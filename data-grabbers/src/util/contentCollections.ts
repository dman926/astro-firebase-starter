import { join as pathJoin } from "path";
import type {
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

export const contentCollectionsDir = pathJoin(
  __dirname,
  "..",
  "src",
  "content"
);

export const node_modulesDir = pathJoin('..', 'node_modules', '**');

/**
 * Basically the same thing as src/utils/firestoreConverter.ts
 * but uses firebase-admin, which is a slightly different shape
 */
export const adminFirestoreConverter = <
  T extends DocumentData
>(): FirestoreDataConverter<T> => ({
  toFirestore(model: T): DocumentData {
    const data = { ...model } as DocumentData;

    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): T {
    const data = snapshot.data() as T;
    return data;
  },
});

export default contentCollectionsDir;
