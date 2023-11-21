import {
  initializeApp,
  App as FirebaseApp,
  Credential,
  cert,
} from "firebase-admin/app";
import { getStorage, Storage as FirebaseStorage } from "firebase-admin/storage";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";
import { resolve as pathResolve } from "path";

const getServiceKey = (): Credential => {
  let serviceKey = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceKey) {
    // Not available in env. Looking for key file
    const keyPath = pathResolve(
      __dirname,
      "..",
      "firebase-service-account-key.json"
    );
    if (existsSync(keyPath)) {
      serviceKey = readFileSync(keyPath, "utf8");
    }
  }
  if (!serviceKey) {
    throw new Error("Missing Firebase Admin SDK key env var and/or file");
  }
  return cert(JSON.parse(serviceKey));
};

export class FirebaseAdmin {
  private static instance: FirebaseAdmin;

  public static bucketName = "cut-and-drop-us.appspot.com";

  private _app: FirebaseApp;

  private _storage: FirebaseStorage;

  private _firestore: Firestore;

  private constructor() {
    this._app = initializeApp({
      credential: getServiceKey(),
    });
    this._storage = getStorage(this._app);
    this._firestore = getFirestore(this._app);
  }

  /**
   * Returns an instance of the FirebaseAdmin class.
   * This should be called before getting `authInstance` or `storageInstance`
   * in order to initialize Firebase the first time.
   *
   * @return {FirebaseAdmin} An instance of the FirebaseAdmin class.
   */
  public static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }

    return FirebaseAdmin.instance;
  }

  public get storage(): FirebaseStorage {
    if (!this._storage) {
      throw new Error(
        "Firebase Storage has not been initialized. Call `FirebaseAdmin.getInstance()` first."
      );
    }
    return this._storage;
  }

  public get firestore(): Firestore {
    if (!this._firestore) {
      throw new Error(
        "Firestore has not been initialized. Call `FirebaseAdmin.getInstance()` first."
      );
    }
    return this._firestore;
  }
}

export default FirebaseAdmin;
