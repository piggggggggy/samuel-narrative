/**
 * About 페이지 컨텐츠 데이터
 */

// 소개 섹션
// **text** 형식으로 강조 표시
export const introduction = {
  paragraphs: [
    "5년차 프론트엔드 개발자 박용태입니다.",
    "기술이 제품의 가치로 이어지는 과정에 관심이 많습니다. 단순히 코드를 작성하는 것에 그치지 않고, **제품과 비즈니스의 맥락에서 문제를 정의하고 해결**하려 합니다. 스스로 역할의 경계를 정해두기보다, **관점과 책임의 범위를 계속해서 넓혀가는 것**을 시도합니다.",
    "1인 개발로 MVP를 런칭한 경험부터, 디자인 시스템 운영과 팀의 기술 기준을 정립하는 일까지 점차 더 넓은 범위에서 제품과 조직에 기여해왔습니다.",
    "**엔드 유저뿐 아니라 함께 일하는 동료 또한 저의 고객**이라고 생각합니다. 개발 도구, 프로세스, 문서화 등 동료의 생산성과 경험에 영향을 주는 영역에서 '이 사람이 무엇을 필요로 하는가'를 고민합니다.",
    "**좋은 제품은 좋은 팀에서 나온다**고 믿습니다. 신뢰 기반의 심리적 안전감이 다양한 의견을 가능하게 하고, 그것이 결국 더 나은 제품으로 이어진다고 생각합니다. 모든 형태의 피드백에 열려 있으며, 받는 사람으로서뿐 아니라 **건강한 피드백을 전달할 수 있는 사람**이 되고자 합니다.",
  ],
};

// 이력 섹션
export interface CareerItem {
  company: string;
  period: string;
  positions: {
    title: string;
    period: string;
  }[];
}

export const careers: CareerItem[] = [
  {
    company: "Megazone Cloud",
    period: "2022.08 ~ 현재",
    positions: [
      { title: "Frontend Part Lead", period: "2025.06 ~ 현재" },
      { title: "Frontend Engineer", period: "2022.08 ~ 2025.05" },
    ],
  },
  {
    company: "My Normal (KetoTable)",
    period: "2021.10 ~ 2022.07",
    positions: [{ title: "Frontend Engineer", period: "2021.10 ~ 2022.07" }],
  },
];

// 경력 상세 타입
export interface AccordionItem {
  title: string;
  subtitle?: string;
  period?: string;
  description: string[];
}

export interface ExperienceSection {
  title: string;
  summary: string; // 카테고리 한줄 요약
  items: AccordionItem[];
}

export interface CompanyExperience {
  company: string;
  sections: ExperienceSection[];
}

// MegazoneCloud 경력 상세
const megazoneExperience: CompanyExperience = {
  company: "Megazone Cloud",
  sections: [
    {
      title: "서비스 개발",
      summary: "B2B SaaS 플랫폼 및 디자인 시스템 개발",
      items: [
        {
          title: "SpaceONE",
          subtitle: "Cloud Management Platform (B2B SaaS)",
          period: "2022.08 ~ 현재",
          description: [
            "멀티 클라우드 환경의 자산·비용·보안을 단일 콘솔에서 통합 운영할 수 있도록 하는 것이 목표. 멀티테넌시 구조에서 조직 간 격리와 역할 기반 접근 제어를 지원.",
            "프론트엔드 전반을 담당하며, 대시보드 시스템 설계와 멀티테넌시 구조 전환을 주도.",

            // "멀티 클라우드 환경의 자산·비용·보안 데이터가 CSP별로 흩어져 있어 운영 복잡도가 높은 엔터프라이즈 고객을 위한 통합 관리 플랫폼입니다.",
            // "이 제품에서 프론트엔드 전반을 담당하며, 고객이 데이터를 직접 조합할 수 있는 대시보드 시스템 설계, 엔터프라이즈 확장을 위한 멀티테넌시 구조 전환 등을 주도했습니다.",
            // "멀티 클라우드 환경을 사용하는 고객이 다수의 CSP 계정과 그로부터 수집되는 자산·비용·보안 리소스를 하나의 콘솔에서 조직·권한 단위로 운영할 수 있도록 하는 플랫폼",
          ],
        },
        {
          title: "Mirinae",
          subtitle: "SpaceONE Design System",
          period: "2022.08 ~ 현재",
          description: [
            "제품 전반의 UI 일관성과 개발 효율을 확보하기 위한 디자인 시스템. 80개 이상의 컴포넌트를 포함.",
            "컴포넌트 설계·개발과 협업 프로세스 정립을 담당.",

            // "제품이 확장되면서 화면마다 UI가 미묘하게 달라지고, 같은 컴포넌트를 반복 개발하는 비효율이 생기기 시작했습니다. SpaceONE과 내부 제품들이 공통으로 사용하는 Vue 기반 디자인 시스템입니다.",
            // "SpaceONE 및 일부 내부 제품에서 공통으로 사용하는 Vue 기반 디자인 시스템으로, UI 일관성과 개발 효율을 동시에 관리",
          ],
        },
        {
          title: "SpaceONE Service Portal",
          subtitle: "SpaceONE 소개 / 데모 신청 / 문서 제공용 포털",
          period: "2022.08 ~ 현재",
          description: [
            "외부 고객과 내부 세일즈/CS 조직이 SpaceONE을 이해하고 활용할 수 있도록 돕는 서비스 진입점 역할의 웹 포털",
          ],
        },
      ],
    },
    {
      title: "주요 업무",
      summary: "대시보드 시스템, 멀티테넌시, 데이터 모델 설계",
      items: [
        {
          title: "커스텀 대시보드 시스템 설계 및 개발",
          description: [
            "*고객사별 요구에 따라 고정된 대시보드를 개별 구현하던 방식의 비효율을 해소하기 위해, 사용자가 직접 데이터를 조합·시각화할 수 있는 범용 대시보드 기능을 설계·개발했습니다.*",

            "Data Source → Data Table → Widget **단방향 의존 구조**의 선언적 아키텍처 설계",
            "스키마 정의만으로 위젯 옵션 UI가 자동 생성되어 **기획 변경 시 코드 수정 최소화**",
            "Viewport 기반 지연 로딩, 위젯 단위 캐싱으로 **초기 렌더링 성능 30% 개선**",
            "내부 영업·데모·CS 조직의 **주요 활용 도구로 정착**",
          ],
        },
        {
          title: "워크스페이스 기반 멀티테넌시 구조 도입",
          description: [
            "*단일 테넌시로 설계된 플랫폼을 워크스페이스 기반 멀티테넌시 구조로 전환했습니다. 대형 엔터프라이즈 고객의 조직별 운영 분리, 보안 요구사항을 수용하기 위한 프로젝트였습니다.*",

            "얽혀 있던 라우팅·상태·권한 로직을 분석하고 **Admin / Workspace 모드로 분리**",
            "테넌시 전환 시 Router 이벤트와 API Client를 연동해 **요청 단위로 스코프를 주입**하는 구조 설계",
            "백엔드 팀과 협업해 **Scope-aware API 구조** 정의",
            "모드 전환 규칙과 권한 처리 흐름을 문서화해 **팀 내 구현 기준으로 정착**",
          ],
        },
        {
          title: "전역 참조 데이터 모델 설계",
          description: [
            "*리소스 ID를 표현하기 위해 모든 참조 데이터를 전역 스토어에 선적재하던 구조를 개선했습니다. 초기 로딩 비용 증가, 메모리 사용, 데이터 관리 복잡도가 누적되는 문제가 있었습니다.*",

            "필요한 시점에 필요한 ID만 조회하는 **Lazy Loading 구조**로 전환",
            "동시 발생하는 다수의 참조 요청을 **단일 API 호출로 처리하는 Batch 로직** 설계",
            "TanStack Query 캐시와 연동해 중복 요청 방지",
            "JavaScript Proxy를 활용해 Map처럼 접근하면 **자동으로 비동기 요청이 트리거되는 인터페이스** 제공",
          ],
        },
      ],
    },
    {
      title: "기술 리더십",
      summary: "기술 도입 및 기준 정립, 개발 도구 제작, 테스트 전략 수립",
      items: [
        {
          title: "기술 도입 및 기준 정립 (TanStack Query)",
          description: [
            "*컴포넌트마다 데이터 페칭 방식이 달라 캐시 정합성 이슈와 중복 요청이 반복되는 문제가 있었습니다. TanStack Query 도입을 주도하고, 팀이 일관되게 사용할 수 있도록 운영 기준을 정립했습니다.*",
            "다중 테넌트와 복잡한 도메인 구조를 고려한 **QueryKey 네이밍 규칙 및 캐시 전략 가이드** 수립",
            "데이터 접근 패턴과 디버깅 기준을 문서화해 **팀 내 공통 기준으로 정착**",
          ],
        },
        {
          title: "Devtools 개발 및 팀 내 정착",
          description: [
            "*Vue 2.7 환경에서 공식 Devtools가 지원되지 않아 쿼리 상태·캐시 구조를 파악하기 어려운 문제가 있었습니다. 팀의 디버깅 효율을 위해 전용 Devtools를 직접 설계·구현하고 SDK로 배포했습니다.*",
            "Chrome Extension 형태로 Query 상태, QueryKey, 캐시 데이터를 실시간 확인",
            "권한 전환 시 캐시 충돌 등 **재현이 어려웠던 문제를 빠르게 추적** 가능",
            "사용 가이드와 함께 배포해 **팀 내 디버깅 기준 통일**",
          ],
        },
        {
          title: "AI-driven E2E 테스트 자동화 도입",
          description: [
            "*핵심 사용자 플로우에서 회귀 이슈가 반복되고, 수동 테스트 부담이 누적되는 문제가 있었습니다. Playwright MCP 기반 E2E 테스트 전략을 수립하고 AI를 활용한 시나리오 설계를 도입했습니다.*",
            "**핵심 플로우 중심**의 테스트 커버리지 정의",
            "AI를 활용한 테스트 시나리오 생성 및 **유지보수 효율화**",
            "회귀 이슈 조기 탐지로 **배포 안정성 향상**",
          ],
        },
      ],
    },
    {
      title: "조직 기여",
      summary: "개발 프로세스 설계, 협업 구조 정착, 운영 효율화",
      items: [
        {
          title: "Design System Scrum 운영",
          description: [
            "*디자인 변경 요청이 산발적으로 들어와 구현 누락, 일정 충돌이 반복되는 문제가 있었습니다. 디자이너-프론트엔드 간 정기 스크럼을 운영해 협업 구조를 정착시켰습니다.*",
            "변경 요청 → 영향 범위 파악 → 릴리즈 계획을 하나의 흐름으로 정리",
            "'의도 / 적용 범위 / 영향 컴포넌트 / 마이그레이션 가이드' **템플릿 표준화**",
            "구현 누락과 해석 차이로 인한 **재작업 감소**",
          ],
        },
        {
          title: "제품 피드백 워크플로우 자동화",
          description: [
            "*Slack에서 발생하는 제품 피드백이 체계적으로 관리되지 않아 누락·중복이 반복되었습니다. Slack → Jira → 회고로 이어지는 피드백 처리 흐름을 자동화했습니다.*",
            "Slack 메시지 액션으로 피드백을 즉시 수집하는 진입점 설계",
            "GPT를 활용해 메시지 요약 및 이슈 유형 자동 분류",
            "Zapier로 Slack, GPT, Jira API를 연동해 티켓 자동 생성",
            "**주당 3-4시간의 수작업 이슈 정리 비용 제거**",
          ],
        },

        {
          title: "AI 활용 방식의 공유 및 팀 내 전파",
          description: [
            "*AI 도구 활용이 개인 실험에 머물고 팀 차원의 적용으로 연결되지 않는 상황이었습니다. 직접 실험한 내용을 정리해 팀과 조직에 공유했습니다.*",
            "Multi-Agent Workflow: **역할 기반 워크플로우 패턴**을 제품 조직에 공유",
            "Context Engineering: PRD/컨벤션/예시를 코드베이스에 관리해 **AI 산출물 품질을 높이는 방법**을 프론트엔드 조직 워크샵으로 진행",
          ],
        },
        {
          title: "SDLC/AIDLC 프로세스 설계 및 개선",
          description: [
            "*이슈 관리가 개인마다 다르게 운영되어 추적과 협업에 비효율이 있었습니다. SDLC와 AI 기반 개발 흐름(AIDLC)을 고려한 팀 프로세스를 설계하고 정착시켰습니다.*",
            "Jira 티켓 작성 기준(재현/기대 동작/환경/우선순위) 표준화",
            "이슈 → 개발 → 검증 → 배포로 이어지는 **운영 흐름 정비**",
            "AI 도구 활용 시 **컨텍스트 관리 기준을 프로세스에 반영**",
          ],
        },
      ],
    },
  ],
};

// My Normal 경력 상세
const myNormalExperience: CompanyExperience = {
  company: "My Normal",
  sections: [
    {
      title: "서비스 개발",
      summary: "헬스케어 다이어리 및 커뮤니티 앱",
      items: [
        {
          title: "인아웃",
          subtitle: "헬스케어 다이어리 및 커뮤니티 앱",
          period: "2021.10 ~ 2022.07",
          description: [
            "음식 섭취 기록과 영양 분석을 제공하는 다이어리 앱으로 시작해, 유저 반응을 기반으로 SNS형 커뮤니티, 다이어트 배틀 기능으로 피봇하며 성장한 제품.",
            "프론트엔드 1인 개발로 MVP 설계부터 런칭, 앱스토어 배포, 이후 기능 확장까지 전반을 담당.",
          ],
        },
        {
          title: "인아웃 어드민",
          subtitle: "인아웃 앱 운영을 위한 관리자 웹 페이지",
          period: "2022.02 ~ 2022.07",
          description: [
            "콘텐츠 관리, 유저 관리, 서비스 지표 확인을 위한 내부 운영 도구로, 서비스 운영과 의사결정을 지원하는 어드민 웹 페이지",
          ],
        },
      ],
    },
    {
      title: "주요 업무",
      summary: "MVP 개발, 앱스토어 배포, 유저 피드백 기반 제품 피봇",
      items: [
        {
          title: "MVP 개발 및 런칭",
          description: [
            "프론트엔드 1인 개발로 MVP 설계부터 개발, 배포까지 전반 담당",
            "빠른 시장 검증을 위해 핵심 기능 중심으로 스코프를 조정하며 출시",
          ],
        },
        {
          title: "모바일 앱 전환 및 스토어 배포",
          description: [
            "React Native + WebView 구조를 활용해 기존 웹 자산을 재사용하며 모바일 앱으로 전환",
            "App Store, Google Play Store 배포 환경 구축 및 릴리즈 전반을 주도",
          ],
        },
        {
          title: "유저 피드백 기반 제품 피봇 참여",
          description: [
            "사용자 반응과 서비스 지표를 기반으로 제품 방향 전환 논의에 참여",
            "다이어리 중심에서 커뮤니티·유저 인터랙션 중심으로 기능을 재정의",
          ],
        },
        {
          title: "어드민 및 운영 기반 구축",
          description: [
            "콘텐츠·유저 관리, 서비스 지표 확인을 위한 내부 운영 도구를 개발",
            "반복 UI 컴포넌트화, 개발 문서 정리로 유지보수 기반을 마련",
          ],
        },
      ],
    },
  ],
};

// 전체 경력 상세 export
export const experiences: CompanyExperience[] = [
  megazoneExperience,
  myNormalExperience,
];

// 자격증 섹션
export interface CertificationItem {
  name: string;
  year: string;
}

export const certifications: CertificationItem[] = [
  { name: "AWS Certified Solutions Architect - Professional", year: "2026" },
  { name: "AWS Certified AI Practitioner", year: "2025" },
];

// 교육 섹션
export interface EducationItem {
  institution: string;
  description: string;
  period: string;
}

export const educations: EducationItem[] = [
  {
    institution: "항해99 플러스",
    description: "프론트엔드 코스",
    period: "2025.09 ~ 2025.12",
  },
  {
    institution: "항해99",
    description: "프론트엔드 코스",
    period: "2021.05 ~ 2021.09",
  },
  {
    institution: "국민대학교",
    description: "산림환경시스템학과",
    period: "2012 ~ 2019",
  },
];
