import type { ContentProvider } from "./types";

export type { Post, ContentProvider, CreatePostInput, UpdatePostInput } from "./types";

type ProviderType = "github" | "notion";

const CONTENT_PROVIDER = (process.env.CONTENT_PROVIDER || "github") as ProviderType;

let providerInstance: ContentProvider | null = null;

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
      const { GitHubProvider } = await import("./github-provider");
      providerInstance = new GitHubProvider();
      break;
    }
  }

  return providerInstance;
}

export function getProviderType(): ProviderType {
  return CONTENT_PROVIDER;
}
