import type { ContentProvider, PostStore } from "./types";

export type {
  Post,
  PostMeta,
  ContentProvider,
  PostStore,
  CreatePostInput,
  UpdatePostInput,
} from "./types";

type ProviderType = "github" | "notion";

const CONTENT_PROVIDER = (process.env.CONTENT_PROVIDER ||
  "github") as ProviderType;

let providerInstance: ContentProvider | null = null;
let storeInstance: PostStore | null = null;

/**
 * 독자 화면용: 배포에 포함된 글을 읽는다.
 */
export async function getContentProvider(): Promise<ContentProvider> {
  if (providerInstance) {
    return providerInstance;
  }

  switch (CONTENT_PROVIDER) {
    case "notion": {
      const { NotionProvider } = await import("./notion-provider");
      providerInstance = new NotionProvider();
      break;
    }
    case "github":
    default: {
      const { SnapshotProvider } = await import("./snapshot-provider");
      providerInstance = new SnapshotProvider();
      break;
    }
  }

  return providerInstance;
}

/**
 * 관리자 화면용: GitHub의 최신 원본을 읽고 쓴다.
 */
export async function getPostStore(): Promise<PostStore> {
  if (!storeInstance) {
    const { GitHubPostStore } = await import("./github-store");
    storeInstance = new GitHubPostStore();
  }

  return storeInstance;
}

export function getProviderType(): ProviderType {
  return CONTENT_PROVIDER;
}
