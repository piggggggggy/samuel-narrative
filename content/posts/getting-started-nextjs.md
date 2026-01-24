---
title: "Next.js 시작하기"
excerpt: "Next.js의 기본 개념과 App Router를 활용한 프로젝트 구성 방법을 알아봅니다."
publishedAt: "2025-01-02"
tags: ["next.js", "react", "tutorial"]
category: "dev"
---

# Next.js 시작하기

Next.js는 React 기반의 풀스택 웹 프레임워크입니다. 서버 사이드 렌더링(SSR), 정적 사이트 생성(SSG), API 라우트 등 다양한 기능을 제공합니다.

## App Router vs Pages Router

Next.js 13부터 도입된 App Router는 React Server Components를 기본으로 사용합니다.

### App Router의 장점

1. **서버 컴포넌트**: 기본적으로 서버에서 렌더링되어 번들 크기 감소
2. **레이아웃 시스템**: 중첩 레이아웃을 쉽게 구현
3. **스트리밍**: 점진적 렌더링으로 빠른 초기 로딩

## 프로젝트 생성

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
```

## 기본 디렉토리 구조

```
app/
├── layout.tsx    # 루트 레이아웃
├── page.tsx      # 홈페이지
├── globals.css   # 전역 스타일
└── posts/
    └── [slug]/
        └── page.tsx  # 동적 라우트
```

## Server Components 활용

```tsx
// 이 컴포넌트는 서버에서 실행됩니다
async function PostList() {
  const posts = await fetchPosts(); // 직접 데이터 fetching

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

다음 포스트에서는 Content Provider 패턴에 대해 알아보겠습니다.
