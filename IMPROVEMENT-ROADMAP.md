# Samuel Narrative 구조와 개선 로드맵

기준일: 2026-11-16, 기준 커밋: `89f9433`에 커밋 전 변경(의존성 갱신, Biome 전환)을 더한 상태

## 1. 현재 구조

```text
독자 화면      → 배포에 포함된 content/posts (목록과 본문 모두)
관리자 화면    → GitHub Contents API (최신 원본 읽기, 커밋으로 저장)
이미지 업로드  → Vercel Blob (uploads/)
배포           → main에 푸시되면 Vercel이 빌드하고 배포
월간 작업      → 참조되지 않는 Blob 이미지 후보 보고 (삭제하지 않음)
```

글의 원본은 GitHub 저장소의 `content/posts/*.md` 하나다. 독자가 보는 목록, 본문, RSS, 사이트맵은 모두 같은 커밋의 파일에서 만들어진다. 글 인덱스는 저장하지 않고 파일에서 계산한다.

글을 저장하면 GitHub에 커밋되고, Vercel 빌드가 끝난 뒤 공개된다. 빌드는 글 frontmatter 검증을 먼저 실행하며, 실패하면 이전 배포가 그대로 유지된다.

### 콘텐츠 계층의 책임

| 파일                                   | 책임                                                               |
| -------------------------------------- | ------------------------------------------------------------------ |
| `src/lib/content/index.ts`             | `getContentProvider()`(독자용), `getPostStore()`(관리자용) 조립    |
| `src/lib/content/types.ts`             | `ContentProvider`(독자 읽기), `PostStore`(관리자 읽기와 쓰기) 계약 |
| `src/lib/content/snapshot-provider.ts` | 배포된 파일만 읽는 독자용 구현. 외부 호출 없음                     |
| `src/lib/content/github-store.ts`      | GitHub 최신 원본 조회, 생성, 수정, 삭제                            |
| `src/lib/content/local-reader.ts`      | 디렉터리에서 글 목록, 단건, 인덱스 계산                            |
| `src/lib/content/markdown.ts`          | frontmatter 파싱과 직렬화, slug 형식 검사                          |
| `src/lib/content/blob-storage.ts`      | 이미지 업로드                                                      |
| `src/lib/schemas/post.ts`              | 글, 생성 입력, 수정 입력의 단일 검증 규칙                          |

### 환경별 동작

| 환경                   | 독자 읽기       | 관리자 읽기                   |
| ---------------------- | --------------- | ----------------------------- |
| 운영                   | 배포된 파일     | GitHub                        |
| 로컬, GitHub 설정 있음 | checkout의 파일 | GitHub                        |
| 로컬, GitHub 설정 없음 | checkout의 파일 | checkout의 파일 (쓰기는 불가) |

GitHub 설정은 `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` 세 값이다. 토큰 없이도 개발 서버와 운영 빌드가 동작한다.

## 2. 검증 상태

| 검사                        | 결과                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm test`                 | 45개 통과                                                                                      |
| `tsc --noEmit`              | 통과                                                                                           |
| `pnpm schema:validate`      | 글 21개 유효                                                                                   |
| 토큰 없는 `pnpm build`      | 성공. 글, 카테고리, RSS, 사이트맵은 정적, `/api/posts`는 동적                                  |
| `pnpm lint` (Biome)         | 오류 0건, 경고 4건(훅 의존성 배열 3건, `<img>` 사용 1건)                                       |
| `pnpm format:check` (Biome) | 불일치 없음                                                                                    |
| 운영 사이트                 | 목록 API 21건, 글 상세 200, 없는 글 404, RSS 21건, 사이트맵 21건, 주소는 `samuel-narrative.me` |

확인하지 못한 것:

- 관리자 화면의 실제 저장 흐름. GitHub 응답을 흉내 낸 테스트로만 검증했다.
- 월간 이미지 보고 워크플로의 `BLOB_READ_WRITE_TOKEN` secret 등록 여부. 다음 실행은 2026-12-01이다.
- 실제 GitHub 계정으로의 로그인. 로그인 흐름은 GitHub 응답을 흉내 낸 테스트로만 검증했다.

## 3. 완료한 개선

| 항목             | 내용                                                                                                                   | 커밋      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | --------- |
| 이미지 정리      | 월간 작업과 CLI를 보고 전용으로 전환. 삭제 코드 제거                                                                   | `0ebab01` |
| pnpm 고정        | `packageManager: pnpm@9.15.9`, 워크플로의 버전 입력 제거                                                               | `d8f7689` |
| 로컬 읽기        | GitHub 설정 없이 checkout의 글을 읽음                                                                                  | `d0daa7e` |
| ESLint 설정      | TS 파일의 `no-undef` 해제, 오류 64건에서 2건으로 감소                                                                  | `2f2cf09` |
| 로그인 복구      | GitHub가 인증 응답에 `iss`를 보내면서 로그인이 실패하던 문제를 next-auth 5.0.0-beta.32로 해결. 로그인 흐름 테스트 추가 | 커밋 전   |
| 의존성 갱신      | Next.js 16.4.6, TypeScript 7.0.2. `tsconfig.json`에서 `baseUrl` 제거                                                   | 커밋 전   |
| 린트와 포맷 도구 | ESLint와 Prettier를 Biome 2.6.7로 교체. 개발 의존성 8개와 설정 파일 3개 제거, 전체 포맷 적용                           | 커밋 전   |
| 파일 규약        | `middleware`를 `proxy`로 변경                                                                                          | `89f9433` |
| 사이트 주소      | robots, 사이트맵, RSS, 동적 OG가 `siteConfig.url` 사용                                                                 | `463d580` |
| 저장 변환        | gray-matter 직렬화, 수정 시 `updatedAt` 기록, 관리하지 않는 frontmatter 키 보존, slug 검증, 생성과 수정 스키마 통합    | `d968794` |
| 독자 읽기 전환   | 독자 화면이 배포된 파일만 읽음. 관리자 저장소 분리. 편집용 API는 관리자 전용                                           | `73d3f1b` |
| 인덱스 제거      | 인덱스 생성 스크립트, 저장된 인덱스, Blob 인덱스 코드, 메모리 캐시 제거. 빌드에 글 검증 추가                           | `6115e07` |
| 배포 경로        | Vercel 자동 빌드로 전환, 매일 재배포 워크플로 제거                                                                     | `ac4d6b3` |

이 전환으로 없어진 문제:

- 목록과 본문이 서로 다른 시점의 데이터를 읽던 불일치
- GitHub 커밋 후 인덱스 갱신이 실패하는 저장 부분 성공
- 관리자 저장과 빌드가 같은 인덱스를 덮어쓰던 경합
- 인스턴스별 메모리 캐시가 갱신되지 않던 문제
- RSS, 사이트맵이 글마다 GitHub API를 호출하던 구조
- 제목에 따옴표가 있으면 저장된 글이 깨지던 문제
- 글을 수정하면 `updatedAt`과 `draft`가 사라지던 문제
- 잘못된 slug가 GitHub 경로에 그대로 들어가던 문제
- 운영의 사이트맵, robots, RSS가 `vercel.app` 주소를 내보내던 문제

## 4. 남은 개선

크기는 한 명 기준의 상대값이다. S는 한두 파일, M은 여러 모듈과 테스트.

### 4.1 독자 화면 (우선)

- [ ] **태그 링크 404** (S): 글 상세가 `/tags/<tag>`로 링크하지만 라우트가 없다. `/tags/[tag]` 페이지를 만들고 한글 태그 인코딩을 처리한다.
- [ ] **테스트 글 공개** (S, 결정 필요): `test-for-deploy`, `production-test`, `test-20260103-01`이 목록과 RSS에 나온다. 지울지, `draft`를 공개 정책으로 구현해 숨길지 정한다. `draft`를 쓴다면 목록, 상세, RSS, 사이트맵에서 모두 제외해야 한다.
- [ ] **목록 오류 표시** (M): `InfinitePostList`가 요청 실패를 "글 없음"으로 보여주고, 필터를 빠르게 바꾸면 늦게 온 응답이 화면을 덮는다. 오류 상태와 재시도를 분리하고 최신 요청만 반영한다.
- [ ] **목록 API 입력 검증** (S): `page=0`, `page=abc`, 잘못된 `category`가 200으로 처리된다. 입력을 검증하고 응답 형태를 하나로 맞춘다.
- [ ] **목차 ID 불일치** (M): 목차는 원문 정규식, 제목 ID는 렌더링된 자식으로 만든다. 굵은 글씨가 든 제목, 반복 제목, 코드 블록 안의 `##`에서 어긋난다. 같은 구문 트리에서 둘을 만든다.
- [ ] **공개 화면의 세션 요청** (S): 루트 레이아웃의 `SessionProvider` 때문에 모든 페이지가 세션을 요청한다. 인증이 필요한 영역으로 범위를 줄인다.

### 4.2 관리자 화면

- [ ] **실제 저장 흐름 확인** (S): 로그인 상태에서 수정 저장, 안내 문구, 공개 반영, frontmatter의 `updatedAt`을 확인한다.
- [ ] **오래된 편집 덮어쓰기** (M): 편집 화면이 읽은 시점의 revision을 저장 요청에 싣지 않는다. 다른 곳에서 먼저 수정된 글을 덮어쓸 수 있다.
- [ ] **GitHub 오류 구분** (M): `github-store.ts`가 조회 실패를 모두 "없음"으로 처리한다. 404, 인증 오류, 한도 초과, 장애를 구분한다.
- [ ] **배포 전 글의 보기 링크** (S): 관리자 목록의 "보기" 링크는 배포 전 새 글에서 404가 된다. 배포 여부를 표시하거나 링크를 조건부로 보여준다.
- [ ] **관리자 목록의 호출 수** (S): 글마다 GitHub API를 호출한다. 목록에는 본문이 필요 없으므로 호출을 줄인다.
- [ ] **편집기 이미지 삽입** (S): 업로드 완료 시점의 오래된 본문에 이미지를 덧붙인다. 업로드 중 입력한 내용이 사라질 수 있다.
- [ ] **삭제 모달 접근성** (S): focus trap과 닫힌 뒤 focus 복원이 없다.

### 4.3 코드 정리

- [ ] **쓰이지 않는 코드** (S, 일부 확인 필요): `/api/og`, `/api/revalidate`, `ThumbnailUpload`, `NotionProvider`와 `CONTENT_PROVIDER` 분기, `getProviderType`, `toPostMeta`, `PostsIndexSchema`. `/api/og`를 지우면 `@vercel/og`도 필요 없다. 두 API는 외부에서 직접 호출하는지 확인한 뒤 지운다.
- [ ] **카테고리 목록 중복** (S): `["dev", "life", "review"]`가 8개 파일에 있다. `CategorySchema.options`로 통일한다.
- [ ] **사이트 이름과 설명 중복** (S): RSS, 동적 OG, 헤더에 문자열로 직접 들어가 있다. `siteConfig`를 쓴다.
- [ ] **`@/lib/utils` 묶음 파일** (S): 브라우저 전용 이미지 압축 코드가 서버 유틸과 함께 내보내진다. 이미지 유틸을 관리자 쪽으로 옮긴다.
- [ ] **스타일 이원화** (M): 공개 화면은 디자인 토큰, 관리자 화면 등 13개 파일은 `text-gray-*`와 `dark:`를 직접 쓴다. 다크 테마가 두 종류라 직접 색상은 어긋날 수 있다.
- [ ] **`@types/nprogress` 위치** (S): `dependencies`에서 `devDependencies`로 옮긴다.

### 4.4 검증 장치

- [ ] **effect 안 상태 설정** (S): `ThemeToggle.tsx`, `Utterances.tsx`가 effect 안에서 상태를 바로 바꾼다. Biome에는 이 검사가 없어 린트로는 잡히지 않는다. 동작이 바뀌므로 화면 확인과 함께 고친다.
- [ ] **PR 검증 워크플로** (S): 설치, `pnpm test`, 타입 검사, `pnpm lint`, `pnpm format:check`, 글 검증을 CI에서 실행한다.
- [ ] **린트 경고 4건** (S): 훅 의존성 배열 3건(`ImageUpload.tsx`, `ProgressBar.tsx`, `ReadingProgress.tsx`)과 `UserMenu.tsx`의 `<img>`.
- [ ] **Node 버전** (S): 로컬은 24, 워크플로는 20이다. GitHub Actions가 Node 20 지원 종료를 경고하고 있다. 버전을 맞추고 고정한다.

### 4.5 의존성과 운영

Biome로 옮기면서 없어진 검사: ESLint 규칙 136개 중 97개가 옮겨졌고 36개는 대응 규칙이 없다. React Compiler 계열 훅 규칙 14개, Next.js 규칙 10개, React 규칙 9개, 그 밖의 3개다. `content/` 폴더는 Biome 대상에서 제외했다.

- [ ] **남은 보안 공지** (M): Critical 0, High 16, Moderate 16, Low 3. High는 `undici`, `js-yaml`, `nanoid`, `postcss`, `@fastify/busboy`, `source-map-js`, `zod`의 하위 의존성이다. 사용 경로별로 나눠 실제 영향을 확인한다.
- [ ] **GitHub secret 정리** (S): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`는 쓰는 곳이 없다. `VERCEL_TOKEN`은 Vercel 계정에서 폐기한다.
- [ ] **이미지 보고 워크플로 확인** (S): 2026-12-01 실행 결과를 확인한다. secret이 없으면 보고 단계에서 실패한다.
- [ ] **SVG 업로드** (S): 업로드 API가 SVG를 공개 Blob에 그대로 올린다. 관리자 전용이라 위험은 낮다. 허용 여부를 정한다.
- [ ] **README** (S): 실행 방법, 환경변수, 배포 방식, 저장 후 공개까지의 흐름을 적는다.

## 5. 운영 메모

- main에 푸시하면 바로 운영 빌드가 시작된다. 관리자 화면에서 글을 저장해도 같은 경로로 배포된다.
- 배포에 문제가 있으면 Vercel 대시보드에서 이전 배포로 되돌린다.
- 독자 읽기 전환을 코드로 되돌리려면 `73d3f1b`와 `6115e07`을 revert하고 배포한다. 예전 코드는 Blob의 `posts-index.json`이 없으면 번들된 인덱스로 대체한다.
- frontmatter가 깨진 글이 저장되면 빌드가 실패하고 이전 배포가 유지된다. 글을 고쳐 다시 저장하면 다음 빌드에서 반영된다.
- 관리자 화면에서 처음 수정하는 글은 frontmatter 표기가 바뀐다. 내용은 같다.
- 이미지 자동 삭제는 꺼져 있다. 다시 켜려면 최신 원본 기준의 참조 확인, 삭제 직전 재검증, 삭제 수 제한, 복구 절차가 먼저 필요하다.

## 6. 검증 명령

```sh
pnpm test
pnpm schema:validate
node_modules/.bin/tsc --noEmit --incremental false
pnpm lint
pnpm format:check
pnpm build
```

`pnpm build`는 외부에 쓰지 않으며 토큰 없이 실행할 수 있다. 빌드와 개발 서버는 같은 `.next`를 쓰므로 동시에 실행하지 않는다.

운영 사이트 확인:

```sh
curl -s https://samuel-narrative.me/api/posts | head -c 200
curl -s -o /dev/null -w "%{http_code}\n" https://samuel-narrative.me/posts/review-book-the-goal-2
curl -s https://samuel-narrative.me/feed.xml | grep -c "<item>"
curl -s https://samuel-narrative.me/sitemap.xml | grep -c "/posts/"
```
