# samuel-narrative

프로젝트 분석과 개선 순서: [개선 로드맵](IMPROVEMENT-ROADMAP.md).

## 이미지 정리 후보 보고

```sh
pnpm test:images
pnpm images:cleanup
# 기존 명령도 동일한 읽기 전용 보고서를 생성합니다.
pnpm images:cleanup:dry
```

현재 두 명령과 월간 GitHub Actions 작업은 **보고 전용**입니다. 실제 삭제 기능은 없으며 `--execute`, `--delete` 등의 인자는 거부됩니다. `npx vercel` 설치/실행 없이 잠금 파일의 `@vercel/blob` SDK로 목록과 메타데이터만 조회합니다.

블로그 이미지가 저장된 Blob store의 `BLOB_READ_WRITE_TOKEN`을 실행 환경에 설정해야 합니다. GitHub Actions에는 같은 이름의 repository secret이 필요합니다. `VERCEL_TOKEN`과 다릅니다. CLI는 `.env.local`을 자동 로드하지 않으며, 토큰을 명령행 인자에 넣거나 커밋하지 마세요. 토큰이 없으면 외부 조회 없이 실패합니다.

보고 조건:

- `content/posts`의 Markdown과 frontmatter, 하위 디렉터리를 함께 검사합니다. 이미지 URL의 query/fragment는 참조 비교에서 제외합니다.
- `uploads/`의 단일 경로 이미지 파일만 후보로 삼고, `posts-index.json`·다른 경로·비이미지 확장자는 제외합니다.
- 업로드 후 7일 미만인 객체와 참조 중인 이미지는 제외합니다. 나머지는 Blob 메타데이터의 이미지 MIME도 확인합니다.
- 모든 목록 페이지를 읽습니다. 잘못된 응답, 반복 cursor, 중복 객체, 파일/메타데이터 조회 실패, 빈 콘텐츠 디렉터리, symlink, 검사 중 콘텐츠 변경은 불완전한 보고 대신 실패로 처리합니다.
- 최대 100페이지/10,000개 객체까지만 검사하며 초과하면 실패합니다. 후보 보고는 전체 검사가 끝난 뒤에만 출력합니다.

보고서는 **현재 로컬 checkout 기준**입니다. GitHub 원본의 최신성, 작성 중인 글, 운영의 모든 참조, 검사 후 변경을 보장하지 않으며 삭제 승인 목록으로 사용하면 안 됩니다. 실제 삭제를 재개하려면 최신 원본과 store를 결합한 검증, 삭제 직전 재검증, 삭제 수 제한, 백업·복구 절차를 별도 구현해야 합니다.

워크플로 변경은 저장소에 반영된 뒤 적용됩니다. 로컬 코드 수정만으로 기존 원격 월간 작업이 중지되지는 않습니다.
