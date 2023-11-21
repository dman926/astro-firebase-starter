import { rm } from 'fs/promises';
import { join as pathJoin } from 'path';
import { glob } from 'glob';
import { getGallery } from './getGallery';
import { getProducts } from './getProducts';
import { isFulfilled, isRejected } from 'shared/isFulfilled';
import {
  contentCollectionsDir,
  node_modulesDir,
} from './util/contentCollections';
import { niceTextList } from './util/niceTextList';

type PromiseTask = () => Promise<void>;

interface PromiseTasks {
  [name: string]: PromiseTask;
}

const PROMISE_TASKS: PromiseTasks = {
  galleries: getGallery,
  products: getProducts,
};

interface LabeledPromiseTask {
  name: string;
  task: PromiseTask;
}

// Premake into an array of objects for iterating
const promises = Object.entries(PROMISE_TASKS).map<LabeledPromiseTask>(
  ([name, task]) => ({
    name,
    task,
  }),
);

const namePromise = async (name: string) => Promise.resolve(name);

interface DeleteContentCollectionDataResult {
  name: string;
  failedFileRm: { name: string; reason: unknown }[];
}

const deleteContentCollectionData = async (name: string) => {
  const files = await glob(
    pathJoin(contentCollectionsDir, name, '**', '*.json'),
    { ignore: node_modulesDir },
  );
  return Promise.all(
    files.map((file) => Promise.allSettled([namePromise(file), rm(file)])),
  )
    .then((results) => {
      return (
        results.filter(
          ([nameResult, rmResult]) =>
            isFulfilled(nameResult) && isRejected(rmResult),
        ) as [PromiseFulfilledResult<string>, PromiseRejectedResult][]
      ).map(([nameResult, rmResult]) => ({
        name: nameResult.value,
        reason: rmResult.reason,
      }));
    })
    .then<DeleteContentCollectionDataResult | undefined>((failedFileRm) => {
      if (failedFileRm.length) {
        return {
          name,
          failedFileRm,
        };
      }
    });
};

const run = async () => {
  console.log(
    `Clearing collection${promises.length > 1 ? 's' : ''} ${niceTextList(
      promises.map(({ name }) => name),
    )}.`,
  );

  const failedCollectionDeletes = await Promise.all(
    promises.map(({ name }) => deleteContentCollectionData(name)),
  )
    .then(
      (result) => result.filter(Boolean) as DeleteContentCollectionDataResult[],
    )
    .then((results) => {
      results.forEach(({ name, failedFileRm }) => {
        if (failedFileRm.length) {
          console.warn(
            `Failed to delete data in "${name}" collection. Data files not deleted:\n${niceTextList(
              failedFileRm.map(({ name, reason }) => `${name}\n${reason}`),
            )}`,
          );
        }
      });

      return results.map(({ name }) => name);
    });

  const validCollectionTasks = promises.filter(
    ({ name }) => !failedCollectionDeletes.includes(name),
  );

  if (failedCollectionDeletes.length) {
    console.warn(
      `${failedCollectionDeletes.length} collection${
        failedCollectionDeletes.length > 1 ? 's' : ''
      } failed to delete.`,
    );
    console.warn(
      'The following collections will be skipped:\n',
      failedCollectionDeletes.join('\n'),
    );
  }

  console.log(
    `Fetching data for the following content collection${
      validCollectionTasks.length > 1 ? 's' : ''
    }:\n`,
    niceTextList(validCollectionTasks.map(({ name }) => name)),
  );

  await Promise.all(
    validCollectionTasks.map(({ name, task }) =>
      Promise.allSettled([namePromise(name), task()]),
    ),
  ).then((results) => {
    // Output any errors grabbing data
    const errors = (
      results
        .map(([nameResult, promiseResult]) => {
          if (isRejected(promiseResult)) {
            let outText: string;

            // Flatten errors to a string
            const promiseRejection = (promiseResult.reason as string[][])
              .map((errors) => errors.join('\n'))
              .join('\n\n');

            if (isFulfilled(nameResult)) {
              outText = `Failed to get ${nameResult.value} data.`;
            } else {
              // This should not happen
              outText = `Failed to fetch and write data for a content collection. But the name was not available.\n${nameResult.reason}`;
            }

            return `${outText}\n${promiseRejection}`;
          }

          return null;
        })
        .filter(Boolean) as string[]
    ).concat(
      failedCollectionDeletes.length
        ? [
            `The following collections were skipped:\n${failedCollectionDeletes.join(
              '\n',
            )}`,
          ]
        : [],
    );

    const errorCount = Math.max(
      0,
      errors.length + failedCollectionDeletes.length - 1,
    );
    if (errorCount) {
      const spacer = '----------';
      console.log();
      console.warn(
        `${errorCount} collection${errorCount > 1 ? 's' : ''} failed.`,
      );
      console.error(`${spacer}\n${errors.join(`\n${spacer}\n`)}`);
      console.log();
    }

    console.log('Data fetching complete');
  });
};

run().catch((error) => {
  console.error(error);
});
