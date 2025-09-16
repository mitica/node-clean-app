import {
  hasValue,
  InvalidInputError,
  isNumber,
  isPositiveNumber
} from ".";

export const emptyCursorPage = <T>(totalCount = 0): CursorPage<T> => ({
  totalCount,
  edges: [],
  pageInfo: { hasNextPage: false }
});

export interface CursorPageParams {
  first: number;
  after?: string;
}

export type CursorPageCreateData<T> = {
  totalCount: number;
  hasNextPage?: boolean;
  items: T[];
};

export type CursorPage<T> = {
  edges: CursorPageEdge<T>[];
  pageInfo: CursorPageInfo;
  totalCount: number;
};

export type CursorPageInfo = {
  endCursor?: string;
  hasNextPage: boolean;
};

export type CursorPageEdge<T> = {
  node: T;
  cursor: string;
};

export type CursorPageCreateInfo<T> = {
  itemCursor: ((item: T, index: number) => string) | keyof T;
};

type CursorTotalCount = number | (() => Promise<number>);

const defaultItemCursor =
  (totalCount: number, after?: string) =>
  <T>(_it: T, index: number) =>
    formatLimitCursor({ after }, index, totalCount);

const getSyncTotalCount = (totalCount: CursorTotalCount, cursor?: string) => {
  if (isNumber(totalCount)) return totalCount;
  return cursor ? parseTotalCountFromCursor(cursor) : null;
};

const getTotalCount = (count: CursorTotalCount) => {
  if (isNumber(count)) return count;
  return count();
};

/**
 * Create cursor page object.
 */
export async function createCursorPage<T>(
  params: CursorPageParams,
  totalCount: CursorTotalCount,
  getItems: (params: CursorPageParams) => Promise<T[]>,
  info?: CursorPageCreateInfo<T>
): Promise<CursorPage<T>> {
  if ((params.first && params.first < 0) || params.first > 50)
    throw new InvalidInputError(`Invalid 'first' argument: ${params.first}`);

  let totalCountNumber = getSyncTotalCount(totalCount, params.after);

  if (totalCount === 0 || totalCountNumber === 0)
    return { totalCount: 0, edges: [], pageInfo: { hasNextPage: false } };

  if (params.first === 0)
    return {
      totalCount: await getTotalCount(totalCountNumber ?? totalCount),
      edges: [],
      pageInfo: { hasNextPage: false }
    };

  let items: T[] = [];

  if (totalCountNumber) items = await getItems(params);
  else {
    const [count, list] = await Promise.all([
      getTotalCount(totalCount),
      getItems(params)
    ]);
    totalCountNumber = count;
    items = list;
  }

  const hasNextPage =
    params.first === items.length && typeof params.first === "number";
  let endCursor = "";

  const itemCursor =
    info?.itemCursor ?? defaultItemCursor(totalCountNumber, params.after);

  const edges = items.map((node, index) => {
    let cursorValue: string | number;
    if (typeof itemCursor === "function") cursorValue = itemCursor(node, index);
    else cursorValue = node[itemCursor] as unknown as string;

    if (!hasValue(cursorValue))
      throw new TypeError(
        `Invalid cursor value for field '${itemCursor.toString()}'`
      );

    endCursor = String(cursorValue);
    return { node, cursor: endCursor };
  });

  const pageInfo = { endCursor, hasNextPage };

  return { edges, pageInfo, totalCount: totalCountNumber };
}

export const formatLimitCursor = (
  { after }: { after?: string },
  index: number,
  totalCount: number
) => {
  let offset = 1;
  if (after) {
    offset = parseInt(after, 10);
    if (!isPositiveNumber(offset)) offset = 1;
    else offset++;
  }
  return `${offset + index}_${totalCount}`;
};

export const parseOffsetFromCursor = (cursor?: string | null) => {
  if (cursor) {
    const offset = parseInt(cursor.split("_")[0], 10);
    if (isPositiveNumber(offset)) return offset;
  }
  return 0;
};

export const parseTotalCountFromCursor = (cursor: string) => {
  if (cursor) {
    const offset = parseInt(cursor.split("_")[1], 10);
    if (isPositiveNumber(offset)) return offset;
  }
  return null;
};
