---
title: "Content Provider 패턴으로 유연한 블로그 만들기"
excerpt: "어댑터 패턴을 활용하여 다양한 컨텐츠 소스를 지원하는 블로그 아키텍처를 설계합니다."
publishedAt: "2025-01-01"
tags: ["architecture", "design-pattern", "blog"]
category: "dev"
---


# Content Provider 패턴

블로그를 만들 때 컨텐츠를 어디에 저장할지는 중요한 결정입니다. 마크다운 파일? Notion? CMS?

Content Provider 패턴을 사용하면 **컨텐츠 소스를 쉽게 교체**할 수 있습니다.

## 아키텍처

```
┌─────────────────────────────────────┐
│         ContentProvider Interface    │
│  getAllPosts() / getPostBySlug()    │
└──────────────┬──────────────────────┘
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
   GitHub   Notion   Future
   Adapter  Adapter  Adapter
```

## 인터페이스 정의

```typescript
interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
}

interface ContentProvider {
  getAllPosts(): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getPostsByTag(tag: string): Promise<Post[]>;
  getAllTags(): Promise<string[]>;
}
```

## Provider 선택

환경변수로 어떤 Provider를 사용할지 결정합니다:

```typescript
const CONTENT_PROVIDER = process.env.CONTENT_PROVIDER || "github";

export async function getContentProvider(): Promise<ContentProvider> {
  switch (CONTENT_PROVIDER) {
    case "notion":
      return new NotionProvider();
    case "github":
    default:
      return new GitHubProvider();
  }
}
```

## 장점

1. **유연성**: 컨텐츠 소스 변경이 쉬움
2. **테스트 용이**: Mock Provider로 테스트 가능
3. **점진적 마이그레이션**: 한 소스에서 다른 소스로 천천히 이동 가능

이 패턴 덕분에 처음에는 GitHub 마크다운으로 시작하고, 나중에 Notion으로 쉽게 전환할 수 있습니다.
